import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "../generated/prisma";

const NODE_ENV = process.env.NODE_ENV;
const envFile = NODE_ENV === "development" ? "../.env.local" : ".env";

config({ path: resolve(__dirname, `../${envFile}`), override: true });

export const PORT = process.env.PORT;

export const prisma = new PrismaClient();

export const jwtSecret = process.env.JWT_SECRET || "";

export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "";

export const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || "";

export const clientURL = process.env.CLIENT_URL;

export const nodemailer_account = {
    user: process.env.NODEMAILER_USER || "",
    pass: process.env.NODEMAILER_PASS || "",
};
