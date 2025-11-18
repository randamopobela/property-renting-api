import { NextFunction, Request, Response } from "express";
import { jwtRefreshSecret, jwtSecret, prisma } from "../../config/env";
import { compare } from "bcrypt";
import { ErrorHandler } from "../../helpers/response.handler";
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

class authService {
    async login(req: Request) {
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

        console.log("ini log setelah buat token", token);

        return { token };
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
