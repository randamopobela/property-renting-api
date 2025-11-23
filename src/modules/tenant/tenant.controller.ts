import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../helpers/response.handler";
import tenantService from "./tenant.service";

class TenantController {
    async getTenantBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await tenantService.getTenantBookings(req, next);
            responseHandler(res, "Booking data successfuly fetched", data);
        } catch (error) {
            next(error);
        }
    }

    async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await tenantService.verifyPayment(req, next);
            responseHandler(res, "Booking data successfuly approved", data);
        } catch (error) {
            next(error);
        }
    }
}

export default new TenantController();
