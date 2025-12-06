import { NextFunction, Request, Response } from "express";
import { clientURL, jwtSecret, prisma } from "../../config/env";
import { compare } from "bcrypt";
import { ErrorHandler, responseHandler } from "../../helpers/response.handler";
import {
    getUserByEmail,
    getUserForResetPassword,
} from "../../helpers/user.prisma";
import {
    IUserLogin,
    IUserResetPassword,
} from "../../interfaces/user.interface";
import { sign, verify } from "jsonwebtoken";
import { hashedPassword } from "../../helpers/bcrypt";
import { sendEmail } from "../../utils/nodemailer";
import { createEmailVerificationToken, verifyJWT } from "../../helpers/jwt";
import { de } from "date-fns/locale";

class authService {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const user = (await getUserByEmail(email)) as IUserLogin;
        if (!user) {
            throw new ErrorHandler("Email is incorrect.", 401);
        } else if (!user.isActive) {
            throw new ErrorHandler("User is not active.", 401);
        } else if (!user.isVerified) {
            throw new ErrorHandler("User is not verified.", 401);
        } else if (!(await compare(password, user.password as string))) {
            throw new ErrorHandler("Password is incorrect.", 401);
        }

        delete user.password;
        const token = sign(user, jwtSecret, {
            expiresIn: "30m",
        });

        console.log("ini log setelah buat token", user);

        return {
            user,
            accessToken: token,
        };
    }
    async register(req: Request, next: NextFunction) {
        try {
            const { email } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new ErrorHandler("Email already in use.", 400);
            }

            await prisma.user.create({
                data: {
                    email,
                },
            });

            const token = createEmailVerificationToken({
                email,
                purpose: "email_verification",
            });

            const verificationUrl = `${clientURL}/verify-email/${token}`;

            await sendEmail(email, "Email Verification", "verifyEmail", {
                name: email,
                link: verificationUrl,
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, firstName, lastName, phone, address, password } =
                req.body;

            if (!token) {
                throw new ErrorHandler("Token is required", 400);
            }

            const decoded = verifyJWT(token) as {
                email: string;
                purpose: string;
            };

            if (!decoded || decoded.purpose !== "email_verification") {
                throw new ErrorHandler("Invalid token purpose", 400);
            }

            const email = decoded.email;

            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                throw new ErrorHandler("User not found.", 404);
            }

            await prisma.user.update({
                where: { email },
                data: {
                    firstName,
                    lastName: lastName || null,
                    phone: phone || null,
                    address: address || null,
                    password: await hashedPassword(password),
                    isVerified: true,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async resendEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            const user = await getUserByEmail(email);

            if (!user) {
                throw new ErrorHandler("Email is incorrect.", 401);
            } else if (user.isActive === false) {
                throw new ErrorHandler("User is not active.", 401);
            } else if (user.isVerified === true) {
                throw new ErrorHandler("User is already verified.", 400);
            }

            const token = createEmailVerificationToken({
                email,
                purpose: "email_verification",
            });

            const verificationUrl = `${clientURL}/verify-email/${token}`;

            await sendEmail(email, "Email Verification", "verifyEmail", {
                name: email,
                link: verificationUrl,
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request) {
        const { email } = req.body;

        const user = (await getUserForResetPassword(
            email
        )) as IUserResetPassword;

        if (!user) {
            throw new ErrorHandler("Email is incorrect.", 401);
        } else if (!user.isActive) {
            throw new ErrorHandler("User is not active.", 401);
        }

        delete user.password;

        // Logic untuk membuat token reset password
        const token = createEmailVerificationToken({
            user,
            purpose: "reset_password",
        });

        // Logic untuk mengirim email dengan token reset password
        const resetLink = `${clientURL}/reset-password/${token}`;

        await sendEmail(user.email, "Request Reset Password", "resetPassword", {
            name: user.firstName,
            link: resetLink,
        });
    }

    async resetPassword(req: Request) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            throw new ErrorHandler("Token and new password are required", 400);
        }

        const decoded = verifyJWT(token) as {
            user: { id: string };
            purpose: string;
        };

        if (!decoded || decoded.purpose !== "reset_password") {
            throw new ErrorHandler("Invalid token purpose", 400);
        }

        // Update pasword baru user
        await prisma.user.update({
            where: { id: decoded.user.id },
            data: { password: await hashedPassword(newPassword) },
        });
    }
}

export default new authService();
