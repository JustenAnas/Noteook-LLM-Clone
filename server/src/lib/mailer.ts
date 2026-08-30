import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "dummy_user",
    pass: process.env.SMTP_PASS || "dummy_pass",
  },
});

export const sendOTP = async (email: string, otp: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Gemini Notebook" <noreply@gemininotebook.local>',
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
    console.log("Message sent: %s", info.messageId);
    
    // For ethereal email in dev, log the preview URL
    if (process.env.SMTP_HOST === "smtp.ethereal.email" || !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error sending email (Check SMTP credentials in .env):", error);
    // In local dev without SMTP, we still want to succeed or log the OTP
    console.log(`[DEV FALLBACK] Sent OTP to ${email}: ${otp}`);
  }
};
