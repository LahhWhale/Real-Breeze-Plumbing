import express from "express";
import multer from "multer";
import { Resend } from "resend";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Allow frontend to talk to backend
app.use(
  cors({
    origin: ["https://realbreezeplumbing.ca", "https://www.realbreezeplumbing.ca"],
    methods: ["POST"],
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Route for contact form
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
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("Error sending email.");
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
