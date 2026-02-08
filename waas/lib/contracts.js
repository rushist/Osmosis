import { ethers } from "ethers";

// Contract addresses - update after deployment
const CONTRACT_ADDRESSES = {
  localhost: {
    WhitelistRegistry: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    Groth16Verifier: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  sepolia: {
    WhitelistRegistry: "0xe306a213c03C97da0A01E10703698d2a41980745",
    Groth16Verifier: "0x02710d319b87c2c0734C9b30fD7F938B42C437CE",
  },
};

// WhitelistRegistry ABI (minimal interface for frontend)
const WHITELIST_REGISTRY_ABI = [
  "function verifyAndRegister(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[3] calldata _pubSignals) external returns (bool)",
  "function isNullifierUsed(uint256 _eventId, uint256 _nullifier) external view returns (bool)",
  "function hasCommitment(uint256 _eventId, uint256 _commitment) external view returns (bool)",
  "function getVerifiedCount(uint256 _eventId) external view returns (uint256)",
  "function getMerkleRoot() external view returns (uint256)",
  "function getNextLeafIndex() external view returns (uint256)",
  "function isValidRoot(uint256 _root) external view returns (bool)",
  "function totalCommitments() external view returns (uint256)",
  "event ApprovalVerified(uint256 indexed eventId, uint256 nullifier, uint256 commitment, uint256 leafIndex, uint256 newRoot, uint256 timestamp)",
  "event RootUpdated(uint256 indexed oldRoot, uint256 indexed newRoot, uint256 leafIndex)",
];

/**
 * Get contract addresses for the current network
 */
export function getContractAddresses(chainId) {
  switch (chainId) {
    case 31337n: // Hardhat local
    case 1337n: // Ganache
      return CONTRACT_ADDRESSES.localhost;
    case 11155111n: // Sepolia
      return CONTRACT_ADDRESSES.sepolia;
    default:
      return null;
  }
}

/**
 * Initialize WhitelistRegistry contract instance
 */
export async function getWhitelistRegistry(signer) {
  const network = await signer.provider.getNetwork();
  const addresses = getContractAddresses(network.chainId);
  console.log(network);
  if (!addresses?.WhitelistRegistry) {
    throw new Error("WhitelistRegistry not deployed on this network");
  }

  return new ethers.Contract(
    addresses.WhitelistRegistry,
    WHITELIST_REGISTRY_ABI,
    signer
  );
}

/**
 * Verify a ZK proof on-chain
 * @param {Object} signer - Ethers signer
 * @param {Object} proofData - Proof data with calldata format (pA, pB, pC, pubSignals)
 * @returns {Object} Result with success status and transaction details
 */
export async function verifyProofOnChain(signer, proofData) {
  try {
    const registry = await getWhitelistRegistry(signer);
    
    // The contract verifyAndRegister takes only 4 arguments:
    // _pA, _pB, _pC, _pubSignals (which contains [commitment, nullifier, eventId, expectedNullifier])
    console.log(proofData);
    const tx = await registry.verifyAndRegister(
      proofData.pA,
      proofData.pB,
      proofData.pC,
      proofData.pubSignals
    );
    
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("On-chain verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if a nullifier has been used for an event
 */
export async function isNullifierUsed(provider, eventId, nullifier) {
  try {
    const network = await provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);
    
    if (!addresses?.WhitelistRegistry) {
      return { checked: false, reason: "Contract not deployed" };
    }

    const registry = new ethers.Contract(
      addresses.WhitelistRegistry,
      WHITELIST_REGISTRY_ABI,
      provider
    );
    
    const used = await registry.isNullifierUsed(eventId, nullifier);
    return { checked: true, used };
  } catch (error) {
    console.error("Error checking nullifier:", error);
    return { checked: false, error: error.message };
  }
}

/**
 * Get verified count for an event
 */
export async function getVerifiedCount(provider, eventId) {
  try {
    const network = await provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);
    
    if (!addresses?.WhitelistRegistry) {
      return { success: false, reason: "Contract not deployed" };
    }

    const registry = new ethers.Contract(
      addresses.WhitelistRegistry,
      WHITELIST_REGISTRY_ABI,
      provider
    );
    
    const count = await registry.getVerifiedCount(eventId);
    return { success: true, count: count.toString() };
  } catch (error) {
    console.error("Error getting verified count:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update contract addresses after deployment
 * Call this with the deployment info
 */
export function setContractAddresses(network, addresses) {
  if (CONTRACT_ADDRESSES[network]) {
    CONTRACT_ADDRESSES[network] = {
      ...CONTRACT_ADDRESSES[network],
      ...addresses,
    };
  }
}
