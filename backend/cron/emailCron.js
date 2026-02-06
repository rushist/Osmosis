const cron = require("node-cron");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { sendQREmail } = require("../services/emailService");

// Retry sending emails for approved QR registrations that haven't been sent
const sendPendingEmails = async () => {
    console.log("[CRON] Checking for pending QR emails...");

    try {
        // Find approved registrations with QR code but email not sent yet
        const pendingEmails = await Registration.find({
            status: "approved",
            qrCode: { $exists: true, $ne: null },
            email: { $exists: true, $ne: "" },
            emailSent: false,
        });

        console.log(`[CRON] Found ${pendingEmails.length} pending emails`);

        for (const registration of pendingEmails) {
            const event = await Event.findById(registration.eventId);
            if (!event || event.approvalType !== "qr") continue;

            const emailSent = await sendQREmail(registration, event);
            if (emailSent) {
                await Registration.findByIdAndUpdate(registration._id, { emailSent: true });
                console.log(`[CRON] Email sent to ${registration.email}`);
            }
        }
    } catch (err) {
        console.error("[CRON] Error in email cron job:", err);
    }
};

// Initialize cron job - runs every 5 minutes
const initEmailCron = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", sendPendingEmails);
    console.log("[CRON] Email cron job initialized - runs every 5 minutes");

    // Also run immediately on startup to catch any pending emails
    sendPendingEmails();
};

module.exports = { initEmailCron, sendPendingEmails };
