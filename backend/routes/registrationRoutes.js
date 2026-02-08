import express from "express";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import { generateQRToken, generateQRCode, sendQREmail } from "../services/emailService.js";
import { generateApprovalProof } from "../services/zkProofService.js";

const router = express.Router();

// Create registration
router.post("/", async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    res.json(registration);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to create registration" });
  }
});

// Approve registration
router.put("/approve/:id", async (req, res) => {
  try {
    const { message, adminWallet } = req.body;

    // Get registration with event details
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    const event = await Event.findById(registration.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    let updateData = {
      status: "approved",
      adminMessage: message,
    };

    // Generate ZK proof for the approval
    try {
      console.log("🔐 Generating ZK proof for approval...");
      const proofResult = await generateApprovalProof({
        walletAddress: registration.walletAddress,
        eventId: registration.eventId.toString(),
        adminWallet: adminWallet || event.createdBy,
      });

      if (proofResult.success) {
        // Save full proof data including calldata for on-chain verification
        updateData.zkProof = {
          proof: proofResult.proof,
          publicSignals: proofResult.publicSignals,
          calldata: proofResult.calldata,
          numericEventId: proofResult.numericEventId,
          isMock: proofResult.isMock || false,
        };
        updateData.proofCommitment = proofResult.commitment;
        updateData.proofNullifier = proofResult.nullifier;
        updateData.proofGeneratedAt = new Date();
        
        console.log("✅ ZK proof generated:", {
          commitment: proofResult.commitment,
          nullifier: proofResult.nullifier,
          hasCalldata: !!proofResult.calldata,
          isMock: proofResult.isMock || false,
        });
      }
    } catch (proofError) {
      console.error("⚠️ ZK proof generation failed (continuing with approval):", proofError.message);
      // Continue with approval even if proof generation fails
    }

    // If it's a QR event, generate QR code
    if (event.approvalType === "qr") {
      const qrToken = generateQRToken();
      const qrData = {
        token: qrToken,
        eventId: event._id.toString(),
        eventTitle: event.title,
        walletAddress: registration.walletAddress,
        timestamp: new Date().toISOString(),
      };

      const qrCode = await generateQRCode(qrData);

      updateData.qrToken = qrToken;
      updateData.qrCode = qrCode;
      updateData.adminMessage = "Please check your email for QR code";
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // If QR event and has email, send email immediately
    if (event.approvalType === "qr" && updatedRegistration.email) {
      const emailSent = await sendQREmail(updatedRegistration, event);
      if (emailSent) {
        await Registration.findByIdAndUpdate(req.params.id, { emailSent: true });
      }
    }

    res.json(updatedRegistration);
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Failed to approve registration" });
  }
});


// Get registrations by user wallet
router.get("/user/:wallet", async (req, res) => {
  try {
    const data = await Registration.find({
      walletAddress: req.params.wallet,
    }).populate("eventId");
    res.json(data);
  } catch (err) {
    console.error("Error fetching user registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Get all registrations for an event
router.get("/event/:eventId", async (req, res) => {
  try {
    const data = await Registration.find({
      eventId: req.params.eventId,
    }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error fetching event registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Get pending registrations for an event
router.get("/event/:eventId/pending", async (req, res) => {
  try {
    const data = await Registration.find({
      eventId: req.params.eventId,
      status: "pending",
    }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error fetching pending registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Verify QR code at event
router.post("/verify-qr", async (req, res) => {
  try {
    const { token, eventId } = req.body;

    const registration = await Registration.findOne({
      qrToken: token,
      eventId: eventId,
      status: "approved",
    }).populate("eventId");

    if (!registration) {
      return res.status(404).json({ valid: false, message: "Invalid QR code" });
    }

    res.json({
      valid: true,
      registration: {
        walletAddress: registration.walletAddress,
        email: registration.email,
        eventTitle: registration.eventId?.title,
        approvedAt: registration.updatedAt,
      },
    });
  } catch (err) {
    console.error("QR verification error:", err);
    res.status(500).json({ error: "Failed to verify QR" });
  }
});

// User cancellation - user cannot attend anymore
router.put("/cancel/:id", async (req, res) => {
  try {
    const { reason, walletAddress } = req.body;

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Verify user owns this registration
    if (registration.walletAddress !== walletAddress) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Can only cancel pending or approved registrations
    if (!["pending", "approved"].includes(registration.status)) {
      return res.status(400).json({ error: "Cannot cancel this registration" });
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        cancellationReason: reason || "No reason provided",
        cancelledAt: new Date(),
        cancelledBy: "user",
      },
      { new: true }
    );

    res.json(updatedRegistration);
  } catch (err) {
    console.error("Cancellation error:", err);
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});

// Admin revoke approval - remove someone from whitelist
router.put("/revoke/:id", async (req, res) => {
  try {
    const { reason } = req.body;

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Can only revoke approved registrations
    if (registration.status !== "approved") {
      return res.status(400).json({ error: "Can only revoke approved registrations" });
    }

    // Get the event to determine approval type
    const event = await Event.findById(registration.eventId);

    // Build update data - invalidate all approval-related data
    const updateData = {
      status: "revoked", // Use 'revoked' status to distinguish from user-cancelled
      cancellationReason: reason || "Revoked by admin",
      cancelledAt: new Date(),
      cancelledBy: "admin",
      adminMessage: reason || "Your approval has been revoked by the admin",
    };

    // Invalidate QR code data (for QR approval type)
    if (event?.approvalType === "qr" || registration.qrToken) {
      updateData.qrToken = null;
      updateData.qrCode = null;
      updateData.emailSent = false;
    }

    // Invalidate ZK proof data (for wallet approval type)  
    if (event?.approvalType === "wallet" || registration.zkProof) {
      updateData.zkProof = null;
      updateData.proofCommitment = null;
      updateData.proofNullifier = null;
      updateData.proofGeneratedAt = null;
      updateData.onChainVerified = false;
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log(`🚫 Approval revoked for registration ${req.params.id} (${event?.approvalType} type)`);

    res.json(updatedRegistration);
  } catch (err) {
    console.error("Revoke error:", err);
    res.status(500).json({ error: "Failed to revoke approval" });
  }
});

// Admin reject registration
router.put("/reject/:id", async (req, res) => {
  try {
    const { message } = req.body;

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        adminMessage: message || "Your registration has been rejected",
      },
      { new: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.json(updatedRegistration);
  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ error: "Failed to reject registration" });
  }
});

// Get cancelled registrations for an event
router.get("/event/:eventId/cancelled", async (req, res) => {
  try {
    const data = await Registration.find({
      eventId: req.params.eventId,
      status: "cancelled",
    }).sort({ cancelledAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error fetching cancelled registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Mark registration as verified on-chain
router.put("/verify-onchain/:id", async (req, res) => {
  try {
    const { txHash, blockNumber, walletAddress } = req.body;

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Verify the wallet address matches
    if (registration.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: "Wallet address mismatch" });
    }

    // Verify registration is approved and has a proof
    if (registration.status !== "approved") {
      return res.status(400).json({ error: "Registration is not approved" });
    }

    if (!registration.zkProof) {
      return res.status(400).json({ error: "No ZK proof found for this registration" });
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        onChainVerified: true,
        onChainTxHash: txHash,
        onChainBlockNumber: blockNumber,
        onChainVerifiedAt: new Date(),
      },
      { new: true }
    );

    console.log(`✅ Registration ${req.params.id} verified on-chain: ${txHash}`);

    res.json(updatedRegistration);
  } catch (err) {
    console.error("On-chain verification update error:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});

export default router;
