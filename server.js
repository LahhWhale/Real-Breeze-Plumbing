import express from "express";
import multer from "multer";
import { Resend } from "resend";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Initialize app
const app = express();

// Allow Render health check
app.get("/", (req, res) => {
  res.send("Real Breeze Plumbing backend is running.");
});

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Allow up to 10 MB total
});

// CORS – must be set BEFORE routes
app.use(
  cors({
    origin: [
      "https://realbreezeplumbing.ca",
      "https://www.realbreezeplumbing.ca",
    ],
    methods: ["POST"],
  })
);

// Express parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resend email service
const resend = new Resend(process.env.RESEND_API_KEY);

// Main email route
app.post("/send-email", upload.array("photos"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const attachments =
      req.files?.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString("base64"),
      })) || [];

    // Send email using Resend
    const result = await resend.emails.send({
      from: "Real Breeze Plumbing <realbreezeplumbing@realbreeze.ca>",
      to: "realbreezeplumbing@gmail.com",
      subject: "New Quote Request from Website",
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
      attachments,
    });

    console.log("✅ Email sent:", result);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Backend running on port 3000");
});
