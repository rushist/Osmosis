const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const crypto = require("crypto");

// Create Gmail transporter
const createTransporter = () => {
    console.log("[EMAIL] Creating transporter with Gmail user:", process.env.GMAIL_USER);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("[EMAIL] ERROR: Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env");
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
};

// Generate unique token for QR code
const generateQRToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Generate QR code as base64
const generateQRCode = async (data) => {
    try {
        console.log("[QR] Generating QR code for data:", JSON.stringify(data));
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
            width: 300,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        });
        console.log("[QR] QR code generated successfully");
        return qrDataUrl;
    } catch (err) {
        console.error("[QR] Error generating QR code:", err);
        return null;
    }
};

// Send QR code email
const sendQREmail = async (registration, event) => {
    console.log("[EMAIL] Attempting to send email...");
    console.log("[EMAIL] Registration:", {
        id: registration._id,
        email: registration.email,
        walletAddress: registration.walletAddress,
    });
    console.log("[EMAIL] Event:", {
        id: event._id,
        title: event.title,
    });

    const transporter = createTransporter();

    if (!transporter) {
        console.error("[EMAIL] Failed to create transporter - check env variables");
        return false;
    }

    if (!registration.qrCode) {
        console.error("[EMAIL] No QR code found in registration");
        return false;
    }

    const recipientEmail = registration.email || "rushabh9372@gmail.com";
    console.log("[EMAIL] Sending to:", recipientEmail);

    try {
        // Generate QR code image as buffer for attachment
        const qrBuffer = Buffer.from(
            registration.qrCode.replace(/^data:image\/png;base64,/, ""),
            "base64"
        );
        console.log("[EMAIL] QR buffer created, size:", qrBuffer.length);

        const mailOptions = {
            from: '"WaaS - Whitelist as a Service" <' + process.env.GMAIL_USER + '>',
            to: recipientEmail,
            subject: "Your QR Code for " + event.title,
            html: getEmailTemplate(registration, event),
            attachments: [
                {
                    filename: "qrcode.png",
                    content: qrBuffer,
                    cid: "qrcode",
                },
            ],
        };

        console.log("[EMAIL] Mail options prepared, sending...");
        const result = await transporter.sendMail(mailOptions);
        console.log("[EMAIL] Email sent successfully!");
        console.log("[EMAIL] Message ID:", result.messageId);
        return true;
    } catch (err) {
        console.error("[EMAIL] Error sending email:", err.message);
        console.error("[EMAIL] Full error:", err);
        return false;
    }
};

// Email HTML template
const getEmailTemplate = (registration, event) => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">WaaS</h1>
        <p style="color: #71717a; margin: 5px 0 0 0;">Whitelist as a Service</p>
      </div>
      
      <!-- Main Card -->
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 40px; text-align: center;">
        <div style="background: #22c55e20; border: 1px solid #22c55e40; border-radius: 12px; padding: 12px 20px; display: inline-block; margin-bottom: 24px;">
          <span style="color: #22c55e; font-weight: 600;">You're Approved!</span>
        </div>
        
        <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px;">${event.title}</h2>
        <p style="color: #a1a1aa; margin: 0 0 30px 0;">
          ${event.place ? "Location: " + event.place : ""} 
          ${event.date ? " | Date: " + event.date : ""}
        </p>
        
        <!-- QR Code -->
        <div style="background: #ffffff; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 24px;">
          <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; display: block;">
        </div>
        
        <p style="color: #71717a; font-size: 14px; margin: 0 0 24px 0;">
          Show this QR code at the event entrance for attendance verification
        </p>
        
        <!-- Wallet Info -->
        <div style="background: #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #71717a; margin: 0 0 4px 0; font-size: 12px;">Registered Wallet</p>
          <p style="color: #ffffff; margin: 0; font-family: 'Courier New', monospace; font-size: 14px;">
            ${registration.walletAddress}
          </p>
        </div>
        
        <p style="color: #52525b; font-size: 12px; margin: 0;">
          This QR code is unique to you. Do not share it with others.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">
          Secured by Zero-Knowledge Proofs
        </p>
      </div>
    </div>
  </body>
</html>
  `;
};

module.exports = {
    generateQRToken,
    generateQRCode,
    sendQREmail,
};
