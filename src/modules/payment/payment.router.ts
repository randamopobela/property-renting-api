import { Router } from "express";
import paymentController from "./payment.controller";
import { uploader } from "../../middlewares/uploader.middleware";
import { verifyToken } from "../../middlewares/auth.middleware";

export const paymentRouter = () => {
    const router = Router();

    // router.use(verifyToken);

    // Route Upload Pembayaran
    // URL: http://localhost:8000/api/v1/payments/:bookingId/payment
    // 'paymentProof' adalah nama field key
    // Method: POST
    // Body: form-data (file)
    // 'proof' adalah inisial nama file
    // '/payments' adalah folder penyimpanan file, di dalam folder '/public'
    router.post(
        "/:bookingId/payment",
        uploader("proof", "/payments").single("paymentProof"),
        paymentController.uploadPaymentProof
    );

    return router;
};
