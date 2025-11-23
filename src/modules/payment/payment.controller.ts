import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../helpers/response.handler";
import paymentService from "./payment.service";

class PaymentController {
    async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await paymentService.uploadPaymentProof(req, next);
            responseHandler(res, "Payment proof successfully uploaded", data);
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
