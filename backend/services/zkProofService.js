const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Paths to circuit build files (adjust based on your setup)
const BC_BUILD_DIR = path.join(__dirname, "..", "..", "BC", "build");
const WASM_PATH = path.join(BC_BUILD_DIR, "ApprovalProof_js", "ApprovalProof.wasm");
const ZKEY_PATH = path.join(BC_BUILD_DIR, "ApprovalProof.zkey");
const VKEY_PATH = path.join(BC_BUILD_DIR, "verification_key.json");

// Cache for verification key
let verificationKey = null;

/**
 * Simple Poseidon-like hash for generating wallet hash
 * In production, use a proper Poseidon implementation
 * This is a simplified version for demonstration
 */
function hashWallet(walletAddress) {
  // Convert wallet address to a numeric representation
  // Remove '0x' prefix and convert to BigInt
  const cleanAddress = walletAddress.toLowerCase().replace("0x", "");
  const hash = crypto.createHash("sha256").update(cleanAddress).digest("hex");
  // Take first 31 bytes to ensure it fits in the field
  return BigInt("0x" + hash.slice(0, 62)).toString();
}

/**
 * Generate a deterministic admin secret from wallet address
 * In production, this should be stored securely per-event
 */
function generateAdminSecret(adminWallet, eventId) {
  const data = `${adminWallet.toLowerCase()}-${eventId}-waas-secret`;
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return BigInt("0x" + hash.slice(0, 62)).toString();
}

/**
 * Compute the nullifier for a wallet + event combination
 * nullifier = hash(walletHash, eventId)
 */
function computeNullifier(walletHash, eventId) {
  const data = `nullifier-${walletHash}-${eventId}`;
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return BigInt("0x" + hash.slice(0, 62)).toString();
}

/**
 * Check if circuit files are available
 */
function isCircuitReady() {
  return fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH);
}

/**
 * Load verification key (cached)
 */
async function getVerificationKey() {
  if (verificationKey) return verificationKey;
  
  if (!fs.existsSync(VKEY_PATH)) {
    throw new Error("Verification key not found. Compile the circuit first.");
  }
  
  verificationKey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf8"));
  return verificationKey;
}

/**
 * Generate a ZK proof for an approval
 * 
 * @param {Object} params
 * @param {string} params.walletAddress - User's wallet address
 * @param {string} params.eventId - MongoDB event ID (will be hashed to numeric)
 * @param {string} params.adminWallet - Admin's wallet address
 * @returns {Object} Proof data including proof, publicSignals, and calldata
 */
async function generateApprovalProof({ walletAddress, eventId, adminWallet }) {
  if (!isCircuitReady()) {
    console.log("⚠️ Circuit not compiled. Returning mock proof data.");
    return generateMockProof({ walletAddress, eventId, adminWallet });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const walletHash = hashWallet(walletAddress);
    const adminSecret = generateAdminSecret(adminWallet, eventId);
    
    // Convert MongoDB ObjectId to numeric eventId
    const numericEventId = BigInt("0x" + eventId.slice(-12)).toString();
    
    // Compute nullifier
    const nullifier = computeNullifier(walletHash, numericEventId);
    
    const input = {
      walletHash,
      adminSecret,
      timestamp,
      eventId: numericEventId,
      nullifier,
    };

    console.log("🔐 Generating ZK proof with input:", {
      ...input,
      adminSecret: "[HIDDEN]",
    });

    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      WASM_PATH,
      ZKEY_PATH
    );

    // Generate Solidity calldata
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    
    // Parse calldata into components
    const calldataArgs = JSON.parse("[" + calldata + "]");

    // Verify locally before returning
    const vkey = await getVerificationKey();
    const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (!isValid) {
      throw new Error("Generated proof failed local verification");
    }

    console.log("✅ ZK proof generated and verified successfully");

    return {
      success: true,
      proof,
      publicSignals,
      calldata: {
        pA: calldataArgs[0],
        pB: calldataArgs[1],
        pC: calldataArgs[2],
        pubSignals: calldataArgs[3],
      },
      commitment: publicSignals[0], // First output is the commitment
      nullifier: publicSignals[1] || nullifier,
      numericEventId,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error generating ZK proof:", error);
    throw error;
  }
}

/**
 * Generate mock proof data when circuit is not compiled
 * Used for development/testing without compiled circuit
 */
function generateMockProof({ walletAddress, eventId, adminWallet }) {
  const walletHash = hashWallet(walletAddress);
  const numericEventId = BigInt("0x" + eventId.slice(-12)).toString();
  const nullifier = computeNullifier(walletHash, numericEventId);
  
  // Generate a mock commitment
  const commitmentData = `${walletHash}-${eventId}-${Date.now()}`;
  const commitment = BigInt(
    "0x" + crypto.createHash("sha256").update(commitmentData).digest("hex").slice(0, 62)
  ).toString();

  // The contract expects pubSignals with 4 elements: [commitment, nullifier, eventId, expectedNullifier]
  const pubSignals = [commitment, nullifier, numericEventId, nullifier];

  return {
    success: true,
    isMock: true,
    proof: {
      pi_a: ["0", "0", "1"],
      pi_b: [["0", "0"], ["0", "0"], ["1", "0"]],
      pi_c: ["0", "0", "1"],
      protocol: "groth16",
    },
    publicSignals: pubSignals,
    calldata: {
      pA: ["0", "0"],
      pB: [["0", "0"], ["0", "0"]],
      pC: ["0", "0"],
      pubSignals: pubSignals,
    },
    commitment,
    nullifier,
    numericEventId,
    generatedAt: new Date().toISOString(),
    note: "Mock proof - circuit not compiled. Run 'npm run compile:circuit' in BC folder.",
  };
}

/**
 * Verify a proof locally (without blockchain)
 */
async function verifyProofLocally(proof, publicSignals) {
  if (!isCircuitReady()) {
    console.log("⚠️ Circuit not compiled. Cannot verify proof.");
    return { valid: false, error: "Circuit not compiled" };
  }

  try {
    const vkey = await getVerificationKey();
    const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    return { valid: isValid };
  } catch (error) {
    console.error("❌ Error verifying proof:", error);
    return { valid: false, error: error.message };
  }
}

module.exports = {
  generateApprovalProof,
  verifyProofLocally,
  isCircuitReady,
  hashWallet,
  computeNullifier,
};
