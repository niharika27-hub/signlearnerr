import express from "express";
import { sendContactEmail } from "../utils/mailer.js";

const router = express.Router();

// POST /api/contact
router.post("/", (req, res) => {
  const { name, email, message, page, type } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ ok: false, message: "Message is required." });
  }

  const adminRecipient = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER || "muskanmittal249@gmail.com";
  const subject = `[Contact] ${type || "feedback"} - ${page || "site"}`;
  const body = [
    `Name: ${name || "Anonymous"}`,
    `Email: ${email || "(not provided)"}`,
    `Page: ${page || "(unknown)"}`,
    `Type: ${type || "general"}`,
    "",
    message,
  ].join("\n");

  // Respond quickly to the client and send email in background to avoid frontend timeout
  res.status(202).json({ ok: true, message: "Message queued for delivery." });

  // Fire-and-forget sending; errors are logged but do not affect response
  sendContactEmail({
    to: adminRecipient,
    fromEmail: email,
    fromName: name,
    subject,
    message: body,
  }).then((result) => {
    console.log("Contact email send result:", result);
  }).catch((err) => {
    console.error("Failed to send contact email:", err);
  });
});

export default router;
