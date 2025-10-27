import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Resend } from "resend";
import cors from "cors";
app.use(cors({ origin: "https://realbreezeplumbing.ca" }));


dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/send-email", upload.array("photos"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Build attachments if photos were uploaded
    const attachments = req.files?.length
      ? req.files.map((file) => ({
          filename: file.originalname,
          content: file.buffer.toString("base64"),
          encoding: "base64",
        }))
      : [];

    // Send email using Resend API
    await resend.emails.send({
      from: "Real Breeze Plumbing <onboarding@resend.dev>",
      to: "realbreezeplumbing@gmail.com",
      subject: "New Quote Request from Website",
      html: `
        <h3>New Quote Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
      attachments: attachments,
    });

    console.log("✅ Email sent successfully!");
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("Error sending email.");
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
