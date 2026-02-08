include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * ApprovalProof Circuit (Circom v1.x compatible with Pedersen hash)
 * 
 * Proves that an admin has approved a user's registration for an event
 * without revealing the user's wallet address on-chain.
 */

template ApprovalProof() {
    // Private inputs (248 bits each to fit in field)
    signal private input walletHash;
    signal private input adminSecret;
    signal private input timestamp;
    
    // Public inputs
    signal input eventId;
    
    // Outputs (all are public signals)
    signal output commitment;
    signal output nullifier;
    
    // Convert inputs to bits for Pedersen hash
    component walletBits = Num2Bits(248);
    walletBits.in <== walletHash;
    
    component eventBits = Num2Bits(248);
    eventBits.in <== eventId;
    
    component adminBits = Num2Bits(248);
    adminBits.in <== adminSecret;
    
    component timestampBits = Num2Bits(248);
    timestampBits.in <== timestamp;
    
    // Compute nullifier = Pedersen(walletHash, eventId)
    component nullifierPedersen = Pedersen(496);
    for (var i = 0; i < 248; i++) {
        nullifierPedersen.in[i] <== walletBits.out[i];
        nullifierPedersen.in[248 + i] <== eventBits.out[i];
    }
    nullifier <== nullifierPedersen.out[0];
    
    // Compute commitment = Pedersen(walletHash, eventId, adminSecret, timestamp)
    component commitPedersen = Pedersen(992);
    for (var i = 0; i < 248; i++) {
        commitPedersen.in[i] <== walletBits.out[i];
        commitPedersen.in[248 + i] <== eventBits.out[i];
        commitPedersen.in[496 + i] <== adminBits.out[i];
        commitPedersen.in[744 + i] <== timestampBits.out[i];
    }
    commitment <== commitPedersen.out[0];
    
    // Ensure timestamp is non-zero
    component isZero = IsZero();
    isZero.in <== timestamp;
    isZero.out === 0;
}

component main = ApprovalProof();

