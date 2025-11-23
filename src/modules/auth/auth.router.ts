import { Router } from "express";
import authController from "./auth.controller";

export const authRouter = () => {
    const router = Router();

    router.post("/register", authController.register);
    router.post("/verify-email", authController.verifyEmail);
    router.post("/resend-email", authController.resendEmail);
    router.post("/login", authController.login);
    // router.post("/forgot-password", authController.forgotPassword);
    // router.post("/reset-password", authController.resetPassword);

    return router;
};
