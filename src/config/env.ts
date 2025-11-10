export const PORT = process.env.PORT || 8000;

export const clientURL = process.env.CLIENT_URL;

export const jwtSecret = process.env.JWT_SECRET;

export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

export const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

export const nodemailer_account = {
    user: process.env.NODEMAILER_USER || "",
    pass: process.env.NODEMAILER_PASS || "",
};
