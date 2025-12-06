import { sign, SignOptions, verify } from "jsonwebtoken";
import { jwtSecret } from "../config/env";

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set in environment variables.");
}

export const generateJWT = (payload: object): string => {
    return sign(payload, jwtSecret, {
        expiresIn: "1h",
    } as SignOptions);
};

export const verifyJWT = (token: string) => {
    return verify(token, jwtSecret);
};

export const createEmailVerificationToken = (payload: object): string => {
    return sign(payload, jwtSecret, {
        expiresIn: "1h",
    } as SignOptions);
};

export const createResetPasswordToken = (payload: object): string => {
    return sign(payload, jwtSecret, {
        expiresIn: "5m",
    } as SignOptions);
};
