const router = require("express").Router();
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { generateQRToken, generateQRCode, sendQREmail } = require("../services/emailService");

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
    const { message } = req.body;

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

module.exports = router;
