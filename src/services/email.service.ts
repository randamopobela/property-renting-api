import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: `"StayEase System" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      console.log("📧 Email sent: %s", info.messageId);
    } catch (error) {
      console.error("🔥 Error sending email:", error);
    }
  }
}

export const emailService = new EmailService();