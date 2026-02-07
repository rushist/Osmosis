const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    walletAddress: String,
    email: String,
    qrToken: String, // Unique token for QR code
    qrCode: String, // Base64 QR code image
    emailSent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "revoked"],
      default: "pending",
    },
    adminMessage: {
      type: String,
      default: "",
    },
    // ZK Proof fields
    zkProof: {
      type: Object, // Stores the full proof object
      default: null,
    },
    proofCommitment: {
      type: String, // The commitment hash from the proof
      default: null,
    },
    proofNullifier: {
      type: String, // Prevents double-verification
      default: null,
    },
    onChainVerified: {
      type: Boolean,
      default: false,
    },
    proofGeneratedAt: {
      type: Date,
      default: null,
    },
    // Cancellation fields
    cancellationReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String, // "user" or "admin"
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Registration", registrationSchema);

