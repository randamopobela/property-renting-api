import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Host SMTP Google
    port: 465, // Port SSL Aman
    secure: true, // Wajib true untuk port 465
    auth: {
        // 👇 Ganti dengan Email Akun Google Anda
        user: process.env.GOOGLE_MAIL_USER, 
        // 👇 Ganti dengan App Password dari Google (BUKAN password akun biasa)
        pass: process.env.GOOGLE_MAIL_PASS, 
    }
});

class EmailService {
    async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await transporter.sendMail({
                from: process.env.MAIL_FROM || "no-reply@stayease.com",
                to: to,
                subject: subject,
                html: html,
            });
            console.log(`[MAIL] ✅ Success: Email sent to ${to}. Message ID: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`[MAIL] 🔥 FAILED: Could not send email to ${to}.`);
            console.error("Mailtrap Connection Error Details:", error);
            throw error; 
        }
    }
}

export const emailService = new EmailService();