// import { NextFunction, Request, Response } from "express";
// import { PointsLogType } from "../generated/prisma";
// import { jwt_reset_secret, jwtSecret, prisma } from "../config/config";
// import { compare } from "bcrypt";
// import { ErrorHandler } from "../helpers/response.handler";
// import {
//     getNewUserName,
//     getUserByEmail,
//     getUserForResetPassword,
// } from "../helpers/user.prisma";
// import { IUserLogin, IUserResetPassword } from "../interfaces/user.interface";
// import { sign, verify } from "jsonwebtoken";
// import { hashedPassword } from "../helpers/bcrypt";
// import { generateReferralCode } from "../helpers/generate.referral";
// import { generateIdUser } from "../helpers/generate.id";
// import { sendEmail } from "../helpers/nodemailer";

// class authService {
//     async login(req: Request) {
//         const { email, password } = req.body;

//         const user = (await getUserByEmail(email)) as IUserLogin;
//         if (!user) {
//             throw new ErrorHandler("Email is incorrect.", 401);
//         } else if (user.isActive === false) {
//             throw new ErrorHandler("User is not active.", 401);
//         } else if (!(await compare(password, user.password as string))) {
//             throw new ErrorHandler("Password is incorrect.", 401);
//         }

//         delete user.password;
//         const token = sign(user, jwtSecret, {
//             expiresIn: "30m",
//         });

//         return { token };
//     }
//     async register(req: Request, next: NextFunction) {
//         try {
//             const {
//                 email,
//                 password,
//                 firstName,
//                 lastName,
//                 userName,
//                 profilePicture,
//                 role,
//                 phone,
//                 address,
//                 referredBy,
//             } = req.body;

//             const newUser = await prisma.user.create({
//                 data: {
//                     id: await generateIdUser(),
//                     email,
//                     password: await hashedPassword(password),
//                     userName: await getNewUserName(firstName, userName ?? null),
//                     firstName,
//                     lastName: lastName ?? null,
//                     profilePicture: profilePicture ?? null,
//                     role,
//                     phone: phone ?? null,
//                     address: address ?? null,
//                     referralCode: generateReferralCode(),
//                 },
//             });

//             if (referredBy) {
//                 // Cari user yang memberikan kode referral
//                 const referrer = await prisma.user.findUnique({
//                     where: { referralCode: referredBy.toUpperCase() },
//                 });

//                 if (!referrer) {
//                     throw new ErrorHandler("Invalid referral code.", 400);
//                 }

//                 // Jumlah poin yang akan diberikan
//                 const bonusPoint = 10000;

//                 // Cek apakah referrer sudah memiliki poin
//                 const existingPoints = await prisma.userPoints.findUnique({
//                     where: { userId: referrer.id },
//                 });

//                 if (!existingPoints) {
//                     await prisma.userPoints.create({
//                         data: {
//                             user: { connect: { id: referrer.id } },
//                             totalPoints: bonusPoint,
//                         },
//                     });
//                 } else {
//                     await prisma.userPoints.update({
//                         where: { userId: referrer.id },
//                         data: {
//                             totalPoints: {
//                                 increment: bonusPoint,
//                             },
//                         },
//                     });
//                 }

//                 // Update point untuk referrer atau pemberi kode referral
//                 await prisma.pointsLog.create({
//                     data: {
//                         user: { connect: { id: referrer.id } },
//                         type: PointsLogType.REFERRAL_BONUS,
//                         description: `Referral bonus from ${newUser.userName}`,
//                         points: bonusPoint,
//                         expiredAt: new Date(
//                             new Date().setMonth(
//                                 new Date().getMonth() + 3 // Masa berlaku kupon selama 3 bulan
//                             )
//                         ),
//                     },
//                 });

//                 // Membuat kupon untuk user baru yang mendaftar dengan kode referral
//                 await prisma.coupon.create({
//                     data: {
//                         title: "Referral Bonus Coupon",
//                         description: `Welcoming coupon special for ${newUser.userName}`,
//                         couponCode: `REF-${newUser.userName.toUpperCase()}`,
//                         discountAmount: 10,
//                         expiredAt: new Date(
//                             new Date().setMonth(
//                                 new Date().getMonth() + 3 // Masa berlaku kupon selama 3 bulan
//                             )
//                         ),
//                         user: { connect: { id: newUser.id } },
//                     },
//                 });

//                 // Update data referral
//                 await prisma.referral.create({
//                     data: {
//                         referrer: { connect: { id: referrer.id } },
//                         referred: { connect: { id: newUser.id } },
//                     },
//                 });
//             }
//         } catch (error) {
//             next(error);
//         }
//     }

//     // async logout(req: Request) {}

//     async forgotPassword(req: Request) {
//         const { email } = req.body;

//         const user = (await getUserForResetPassword(
//             email
//         )) as IUserResetPassword;

//         if (!user) {
//             throw new ErrorHandler("Email is incorrect.", 401);
//         } else if (user.isActive === false) {
//             throw new ErrorHandler("User is not active.", 401);
//         }

//         delete user.password;

//         // Logic untuk membuat token reset password
//         const token = sign(user, jwt_reset_secret, {
//             expiresIn: "5m",
//         });

//         // Logic untuk mengirim email dengan token reset password
//         const resetLink = `http://localhost:3000/reset-password?token=${token}`;

//         await sendEmail(user.email, "Password Reset Request", "resetPassword", {
//             name: user.firstName,
//             link: resetLink,
//         });
//     }

//     async resetPassword(req: Request) {
//         const { token, newPassword } = req.body;

//         if (!token || !newPassword) {
//             throw new ErrorHandler("Token and new password are required", 400);
//         }

//         // Memverifikasi token
//         const decoded = verify(token, jwt_reset_secret as string) as {
//             id: string;
//         };

//         // Update pasword baru user
//         await prisma.user.update({
//             where: { id: decoded.id },
//             data: { password: await hashedPassword(newPassword) },
//         });
//     }
// }

// export default new authService();
