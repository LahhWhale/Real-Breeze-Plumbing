import express from "express";
import multer from "multer";
import { Resend } from "resend";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize app & upload
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ SUPER PERMISSIVE CORS (for this simple API)
app.use(cors());           // allow all origins for now
app.options("*", cors());  // respond to all preflight OPTIONS

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Email route
app.post("/send-email", upload.array("photos"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const attachments =
      req.files?.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString("base64"),
      })) || [];

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

    console.log("✅ Email sent successfully:", result);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ ok: false, error: "Error sending email" });
  }
});

// ✅ Use Render's port env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
