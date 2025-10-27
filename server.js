// =====================================
// Real Breeze Plumbing - Email Server (Gmail Version)
// =====================================

import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your static website files (index.html, css/, assets/)
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// =====================================
// 📩 Email Sending Route
// =====================================
app.post("/send-email", upload.array("photos"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Real Breeze Plumbing" <${process.env.EMAIL_USER}>`,
      to: "realbreezeplumbing@gmail.com", // you’ll receive it here
      subject: "New Quote Request from Website",
      text: `
        🧾 New Quote Request from Website
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        
        Message:
        ${message}
      `,
      attachments: req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      })),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent from ${name} (${email})`);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("Error sending email.");
  }
});

// =====================================
// 🚀 Start the Server
// =====================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
