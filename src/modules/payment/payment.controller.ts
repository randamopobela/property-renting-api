import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';

const paymentService = new PaymentService();

export class PaymentController {
    
    // Handler untuk menerima JSON notifikasi dari Midtrans
    async handleNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const notification = req.body;
            
            // Log untuk melihat isi notifikasi (Penting untuk debugging!)
            console.log("==========================================");
            console.log("🔔 MIDTRANS NOTIFICATION RECEIVED");
            console.log("Order ID:", notification.order_id);
            console.log("Transaction Status:", notification.transaction_status);
            console.log("==========================================");

            // Panggil service untuk memproses notifikasi
            await paymentService.processNotification(notification);

            // Midtrans MENGHARAPKAN balasan 200 OK
            res.status(200).json({ message: "Notification processed successfully" });

        } catch (error) {
            console.error("🔥 Error processing Midtrans notification:", error);
            // Tetap kirim 200 ke Midtrans agar tidak mengirim notifikasi berulang
            res.status(200).json({ message: "Error processing, but acknowledged" }); 
        }
    }
} 8 