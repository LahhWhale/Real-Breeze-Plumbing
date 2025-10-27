import nodemailer from "nodemailer";
import multiparty from "multiparty";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse form-data (for images)
    const form = new multiparty.Form();
    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const name = data.fields.name?.[0] || "";
    const email = data.fields.email?.[0] || "";
    const phone = data.fields.phone?.[0] || "";
    const message = data.fields.message?.[0] || "";

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare attachments (images)
    const attachments =
      data.files.photos?.map((file) => ({
        filename: file.originalFilename,
        content: fs.readFileSync(file.path),
      })) || [];

    // Email body
    const mailOptions = {
      from: `"Real Breeze Plumbing" <${process.env.EMAIL_USER}>`,
      to: "realbreezeplumbing@gmail.com",
      subject: "New Quote Request with Photos",
      text: `
        🧾 New Quote Request
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully from ${name}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" }),
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send message." }),
    };
  }
};
