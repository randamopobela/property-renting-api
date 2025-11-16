import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../helpers/response.handler";
import authService from "./auth.service";

class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await authService.login(req);
            responseHandler(res, "Login success", data);
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await authService.register(req, next);
            responseHandler(res, "Registration success, please login!", data);
        } catch (error) {
            throw next(error);
        }
    }

    // async forgotPassword(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const data = await authService.forgotPassword(req);
    //         responseHandler(
    //             res,
    //             "Email for reset password has been sent",
    //             data
    //         );
    //     } catch (error) {
    //         throw next(error);
    //     }
    // }

    // async resetPassword(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const data = await authService.resetPassword(req);
    //         responseHandler(res, "Password successfully changed", data);
    //     } catch (error) {
    //         throw next(error);
    //     }
    // }
}

export default new AuthController();
