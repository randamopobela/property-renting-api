import { NextFunction, Request, Response } from "express";
import { jwtRefreshSecret, jwtSecret, prisma } from "../../config/env";
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
import { access } from "fs";

class authService {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const user = (await getUserByEmail(email)) as IUserLogin;
        if (!user) {
            throw new ErrorHandler("Email is incorrect.", 401);
        } else if (user.isActive === false) {
            throw new ErrorHandler("User is not active.", 401);
        } else if (user.isVerified === false) {
            throw new ErrorHandler("User is not verified.", 401);
        } else if (!(await compare(password, user.password as string))) {
            throw new ErrorHandler("Password is incorrect.", 401);
        }

        delete user.password;
        const token = sign(user, jwtSecret, {
            expiresIn: "30m",
        });

        console.log("ini log setelah buat token", user, token);

        return {
            user,
            accessToken: token,
        };
    }
    async register(req: Request, next: NextFunction) {
        try {
            const {
                email,
                password,
                firstName,
                lastName,
                profilePicture,
                phone,
                address,
            } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new ErrorHandler("Email already in use.", 400);
            }

            await prisma.user.create({
                data: {
                    email,
                    password: await hashedPassword(password),
                    firstName,
                    lastName: lastName ?? null,
                    profilePicture: profilePicture ?? null,
                    phone: phone ?? null,
                    address: address ?? null,
                },
            });

            const token = createEmailVerificationToken({
                email,
                purpose: "email_verification",
            });

            const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

            await sendEmail(email, "Email Verification", "verifyEmail", {
                name: firstName,
                link: verificationUrl,
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.body;

            if (!token) {
                throw new ErrorHandler("Token is required", 400);
            }

            const decoded = verifyJWT(token) as {
                email: string;
                purpose: string;
            };

            if (decoded.purpose !== "email_verification") {
                throw new ErrorHandler("Invalid token purpose", 400);
            }

            await prisma.user.update({
                where: { email: decoded.email },
                data: { isVerified: true },
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

            const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

            await sendEmail(email, "Email Verification", "verifyEmail", {
                name: user.firstName,
                link: verificationUrl,
            });
        } catch (error) {
            next(error);
        }
    }

    // async forgotPassword(req: Request) {
    //     const { email } = req.body;

    //     const user = (await getUserForResetPassword(
    //         email
    //     )) as IUserResetPassword;

    //     if (!user) {
    //         throw new ErrorHandler("Email is incorrect.", 401);
    //     } else if (user.isActive === false) {
    //         throw new ErrorHandler("User is not active.", 401);
    //     }

    //     delete user.password;

    //     // Logic untuk membuat token reset password
    //     const token = sign(user, jwtRefreshSecret, {
    //         expiresIn: "5m",
    //     });

    //     // Logic untuk mengirim email dengan token reset password
    //     const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    //     await sendEmail(user.email, "Password Reset Request", "resetPassword", {
    //         name: user.firstName,
    //         link: resetLink,
    //     });
    // }

    // async resetPassword(req: Request) {
    //     const { token, newPassword } = req.body;

    //     if (!token || !newPassword) {
    //         throw new ErrorHandler("Token and new password are required", 400);
    //     }

    //     // Memverifikasi token
    //     const decoded = verify(token, jwtRefreshSecret as string) as {
    //         id: string;
    //     };

    //     // Update pasword baru user
    //     await prisma.user.update({
    //         where: { id: decoded.id },
    //         data: { password: await hashedPassword(newPassword) },
    //     });
    // }
}

export default new authService();
