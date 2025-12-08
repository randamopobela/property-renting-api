import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';

const paymentService = new PaymentService();

export class PaymentController {
    
    async handleNotification(req: Request, res: Response, next: NextFunction) {
        try {
            // 👇 LOGGING EKSTREM (CCTV)
            console.log("\n🔥🔥🔥 [CCTV] ADA PAKET MASUK KE CONTROLLER! 🔥🔥🔥");
            console.log("Headers:", req.headers);
            console.log("Body:", JSON.stringify(req.body, null, 2));
            console.log("------------------------------------------------\n");

            const notification = req.body;
            
            await paymentService.processNotification(notification);

            res.status(200).json({ message: "Notification processed successfully" });
        } catch (error) {
            console.error("🔥 Error processing Midtrans notification:", error);
            res.status(200).json({ message: "Error processing, but acknowledged" }); 
        }
    }
}