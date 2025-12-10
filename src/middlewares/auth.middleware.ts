import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/env";
import { verifyJWT } from "../helpers/jwt";
import { ErrorHandler } from "../helpers/response.handler";
import TUser from "../types/user.type";
import { verify } from "jsonwebtoken";

// export const uniqueUserGuard = async (
//     req: Request,
//     _: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { email } = req.body;
//         const user = await prisma.user.findUnique({
//             where: {
//                 email,
//             },
//         });
//         if (user) throw new ErrorHandler("User already exists", 400);
//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export const adminGuard = async (
//     req: Request,
//     _: Response,
//     next: NextFunction
// ) => {
//     try {
//         if (!req.user) throw new ErrorHandler("User not authenticated", 401);
//         if (req.user.role !== "ADMIN")
//             throw new ErrorHandler("Access denied: Admins only", 403);
//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export const organizerGuard = async (
//     req: Request,
//     _: Response,
//     next: NextFunction
// ) => {
//     try {
//         if (!req.user) throw new ErrorHandler("User not authenticated", 401);
//         const allowRoles = ["ORGANIZER", "ADMIN"];
//         if (!allowRoles.includes(req.user.role))
//             throw new ErrorHandler("Access denied", 403);
//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export const verifyToken = async (
//     req: Request,
//     _: Response,
//     next: NextFunction
// ) => {
//     try {
//         const headerValue = req.headers.authorization;
//         const rawHeader = Array.isArray(headerValue)
//             ? headerValue[0]
//             : headerValue;
//         if (!rawHeader)
//             throw new ErrorHandler("Authorization header missing", 401);

//         const token = rawHeader.replace(/^Bearer\s+/i, "").trim();
//         if (!token) throw new ErrorHandler("Token missing", 401);

//         const decoded = verifyJWT(token) as TUser;
//         if (!decoded) throw new ErrorHandler("Invalid token", 403);

//         // normalize nullable fields to match IUserLogin (which expects string | undefined)
//         const userForReq = {
//             ...decoded,
//             lastName: decoded.lastName ?? undefined,
//             profilePicture: decoded.profilePicture ?? undefined,
//         };
//         req.user = userForReq as any;
//         next();
//     } catch (error) {
//         next(error);
//     }
// };

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    
    if (!header) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = header.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Malformed token" });
    }

    // 3. Verifikasi Token
    const secret = process.env.JWT_SECRET || "secret_key_default";
    
    const verified = verify(token, secret);

    (req as any).user = verified;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};