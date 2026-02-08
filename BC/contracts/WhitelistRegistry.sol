// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGroth16Verifier
 * @dev Interface for the auto-generated Groth16 verifier
 */
interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

/**
 * @title MerkleTree
 * @dev Simple incremental Merkle tree for storing commitments
 *      Uses keccak256 for hashing (for simplicity)
 *      Tree depth is fixed at 20 levels (supports ~1M leaves)
 */
library MerkleTreeLib {
    uint256 constant TREE_DEPTH = 20;
    
    struct Tree {
        uint256 nextLeafIndex;
        uint256[TREE_DEPTH] filledSubtrees;
        uint256 root;
    }
    
    // Zero values for empty tree nodes at each level
    // These are precomputed: zeros[i] = hash(zeros[i-1], zeros[i-1])
    function getZero(uint256 level) internal pure returns (uint256) {
        if (level == 0) return 0;
        if (level == 1) return uint256(keccak256(abi.encodePacked(uint256(0), uint256(0))));
        // For simplicity, return a constant for higher levels
        // In production, precompute all 20 levels
        return uint256(keccak256(abi.encodePacked(level)));
    }
    
    function initialize(Tree storage tree) internal {
        for (uint256 i = 0; i < TREE_DEPTH; i++) {
            tree.filledSubtrees[i] = getZero(i);
        }
        tree.root = getZero(TREE_DEPTH);
    }
    
    function insert(Tree storage tree, uint256 leaf) internal returns (uint256) {
        require(tree.nextLeafIndex < 2**TREE_DEPTH, "Tree is full");
        
        uint256 currentIndex = tree.nextLeafIndex;
        uint256 currentHash = leaf;
        
        for (uint256 i = 0; i < TREE_DEPTH; i++) {
            if (currentIndex % 2 == 0) {
                // Left child
                tree.filledSubtrees[i] = currentHash;
                currentHash = uint256(keccak256(abi.encodePacked(currentHash, getZero(i))));
            } else {
                // Right child
                currentHash = uint256(keccak256(abi.encodePacked(tree.filledSubtrees[i], currentHash)));
            }
            currentIndex /= 2;
        }
        
        tree.root = currentHash;
        tree.nextLeafIndex++;
        
        return tree.nextLeafIndex - 1; // Return the index of inserted leaf
    }
}

/**
 * @title WhitelistRegistry
 * @dev On-chain registry for verified event whitelist approvals using ZK proofs
 *      Now includes Merkle tree for storing commitments
 */
contract WhitelistRegistry {
    using MerkleTreeLib for MerkleTreeLib.Tree;
    
    // The Groth16 verifier contract
    IGroth16Verifier public verifier;
    
    // Admin address (deployer)
    address public admin;
    
    // Merkle tree for storing all commitments
    MerkleTreeLib.Tree private commitmentTree;
    
    // Historical roots for verification
    mapping(uint256 => bool) public isKnownRoot;
    uint256 public constant ROOT_HISTORY_SIZE = 100;
    uint256[ROOT_HISTORY_SIZE] public rootHistory;
    uint256 public currentRootIndex;
    
    // Mapping: eventId => nullifier => isVerified
    // Nullifier prevents double-verification of the same approval
    mapping(uint256 => mapping(uint256 => bool)) public verifiedApprovals;
    
    // Mapping: eventId => commitment => exists
    // Stores all valid commitment hashes for an event
    mapping(uint256 => mapping(uint256 => bool)) public commitments;
    
    // Mapping: leafIndex => commitment (for retrieval)
    mapping(uint256 => uint256) public leafToCommitment;
    
    // Mapping: eventId => total verified count
    mapping(uint256 => uint256) public eventVerifiedCount;
    
    // Total commitments across all events
    uint256 public totalCommitments;
    
    // Events
    event ApprovalVerified(
        uint256 indexed eventId,
        uint256 nullifier,
        uint256 commitment,
        uint256 leafIndex,
        uint256 newRoot,
        uint256 timestamp
    );
    
    event RootUpdated(uint256 indexed oldRoot, uint256 indexed newRoot, uint256 leafIndex);
    event VerifierUpdated(address oldVerifier, address newVerifier);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(address _verifier) {
        verifier = IGroth16Verifier(_verifier);
        admin = msg.sender;
        
        // Initialize Merkle tree
        commitmentTree.initialize();
        isKnownRoot[commitmentTree.root] = true;
        rootHistory[0] = commitmentTree.root;
    }

    /**
     * @dev Get the current Merkle root
     */
    function getMerkleRoot() external view returns (uint256) {
        return commitmentTree.root;
    }
    
    /**
     * @dev Get the next available leaf index
     */
    function getNextLeafIndex() external view returns (uint256) {
        return commitmentTree.nextLeafIndex;
    }

    /**
     * @dev Verify a ZK proof and register the approval on-chain
     *      Adds commitment to Merkle tree
     * @param _pA Proof element A
     * @param _pB Proof element B
     * @param _pC Proof element C
     * @param _pubSignals The 3 public signals from proof [commitment, nullifier, eventId]
     */
    function verifyAndRegister(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external returns (bool) {
        uint256 _commitment = _pubSignals[0];
        uint256 _nullifier = _pubSignals[1];
        uint256 _eventId = _pubSignals[2];
        
        // Check nullifier hasn't been used
        require(
            !verifiedApprovals[_eventId][_nullifier],
            "Approval already verified"
        );
        
        // Verify the proof
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "Invalid ZK proof");
        
        // Register the approval
        verifiedApprovals[_eventId][_nullifier] = true;
        commitments[_eventId][_commitment] = true;
        eventVerifiedCount[_eventId]++;
        
        // Add commitment to Merkle tree
        uint256 oldRoot = commitmentTree.root;
        uint256 leafIndex = commitmentTree.insert(_commitment);
        uint256 newRoot = commitmentTree.root;
        
        // Store in root history
        currentRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        rootHistory[currentRootIndex] = newRoot;
        isKnownRoot[newRoot] = true;
        
        // Store leaf mapping
        leafToCommitment[leafIndex] = _commitment;
        totalCommitments++;
        
        emit RootUpdated(oldRoot, newRoot, leafIndex);
        emit ApprovalVerified(_eventId, _nullifier, _commitment, leafIndex, newRoot, block.timestamp);
        
        return true;
    }

    /**
     * @dev Check if a nullifier has been used for an event
     */
    function isNullifierUsed(uint256 _eventId, uint256 _nullifier) 
        external 
        view 
        returns (bool) 
    {
        return verifiedApprovals[_eventId][_nullifier];
    }

    /**
     * @dev Check if a commitment exists for an event
     */
    function hasCommitment(uint256 _eventId, uint256 _commitment) 
        external 
        view 
        returns (bool) 
    {
        return commitments[_eventId][_commitment];
    }

    /**
     * @dev Get the count of verified approvals for an event
     */
    function getVerifiedCount(uint256 _eventId) external view returns (uint256) {
        return eventVerifiedCount[_eventId];
    }
    
    /**
     * @dev Check if a root is in history
     */
    function isValidRoot(uint256 _root) external view returns (bool) {
        return isKnownRoot[_root];
    }

    /**
     * @dev Update the verifier contract (admin only)
     */
    function updateVerifier(address _newVerifier) external onlyAdmin {
        address oldVerifier = address(verifier);
        verifier = IGroth16Verifier(_newVerifier);
        emit VerifierUpdated(oldVerifier, _newVerifier);
    }

    /**
     * @dev Transfer admin rights
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
}
