import nodemailer from "nodemailer";
import path from "path";
// import hbs from "nodemailer-express-handlebars";
import { hbs } from "./handlebar";
// import { create } from "express-handlebars";
import { nodemailer_account } from "../config/env";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        ...nodemailer_account,
    },
});

// const handlebarOptions = {
//     viewEngine: create({
//         extname: ".hbs",
//         partialsDir: path.resolve("./src/templates/"),
//         layoutsDir: path.resolve("./src/templates/"),
//         defaultLayout: false,
//     }),
//     viewPath: path.resolve("./src/templates/"),
//     extName: ".hbs",
// };

// transporter.use("compile", hbs(handlebarOptions));

export const sendEmail = async (
    to: string,
    subject: string,
    template: string,
    context: Record<string, any> // Mengganti nama userInfo menjadi context lebih umum
) => {
    try {
        const compiledTemplate = hbs(`${template}.hbs`);
        const html = compiledTemplate(context);

        await transporter.sendMail({
            from: nodemailer_account.user,
            to,
            subject,
            html,
        });

        console.log(`Email berhasil dikirim ke ${to}`);
        return true; // Kembalikan true jika berhasil
    } catch (error) {
        console.error(`Gagal mengirim email ke ${to}:`, error);
        // Sebaiknya jangan melempar error di sini agar tidak menghentikan proses utama
        // Cukup kembalikan false atau log errornya.
        return false;
    }
};
