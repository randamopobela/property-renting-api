import { PrismaClient, BookingStatus, PaymentStatus } from '../../generated/prisma';
import MidtransClient from 'midtrans-client';
import { emailService } from "../../services/email.service";
import { paymentSuccessTemplate } from '../../helpers/emailTemplates';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Ambil data dari environment (pastikan .env diisi)
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxxxxxxx";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxxxxxxx";

const prisma = new PrismaClient();

interface CustomerDetails {
  firstName: string;
  email: string;
  phone?: string;
}

// Inisiasi Midtrans Snap Client
const snap = new MidtransClient.Snap({
  isProduction: false, // Ubah ke true jika sudah produksi
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

export class PaymentService {
  async createTransaction(bookingId: string, amount: number, customer: CustomerDetails) {
    const parameter = {
      transaction_details: {
        order_id: bookingId,
        gross_amount: amount,
      },
      customer_details: customer,
      credit_card: {
        secure: true,
      },
      callbacks: {
          finish: `http://localhost:3000/booking/payment/${bookingId}/status`, 
      }
    };

    const transaction = await snap.createTransaction(parameter);
    return transaction; 
  }

  async processNotification(notification: any) {
    const { 
        order_id, 
        transaction_status, 
        fraud_status, 
        gross_amount 
    } = notification;

    // 1. Ambil data Booking dan Payment yang terkait
    const booking = await prisma.booking.findUnique({
        where: { id: order_id },
        include: { 
            user: true, 
            room: { include: { property: true } },
            payments: true 
        }
    });

    if (!booking) {
        console.error(`[WEBHOOK] Booking ID ${order_id} not found.`);
        throw new Error("Booking not found");
    }

    const currentPayment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments;
    if (!currentPayment) {
        console.error(`[WEBHOOK] Payment record for Booking ID ${order_id} not found.`);
        throw new Error("Payment record not found");
    }
    
    // 2. Verifikasi Keamanan (Signature Hash)
    // Walaupun Midtrans-Client bisa verifikasi, kita harus pastikan ini sudah diaktifkan
    // Jika perlu verifikasi hash, gunakan MidtransClient.Notification

    // 3. Tentukan Status Akhir
    let finalBookingStatus: BookingStatus;
    let finalPaymentStatus: PaymentStatus;

    if (transaction_status == 'capture' && fraud_status == 'accept') {
        finalBookingStatus = BookingStatus.PAID;
        finalPaymentStatus = PaymentStatus.PAID;
    } else if (transaction_status == 'settlement') {
        finalBookingStatus = BookingStatus.PAID;
        finalPaymentStatus = PaymentStatus.PAID;
    } else if (transaction_status == 'pending') {
        finalBookingStatus = BookingStatus.PENDING;
        finalPaymentStatus = PaymentStatus.WAITING;
    } else if (transaction_status == 'deny' || transaction_status == 'cancel' || transaction_status == 'expire') {
        finalBookingStatus = BookingStatus.CANCELLED;
        finalPaymentStatus = PaymentStatus.FAILED;
    } else {
        // Status lain (refund, partial, dll) di luar scope standar
        console.warn(`[WEBHOOK] Unhandled transaction status: ${transaction_status}`);
        return; 
    }
    
    // 4. Update Database hanya jika status berubah ke PAID
    if (booking.status !== finalBookingStatus) {
        await prisma.$transaction(async (tx) => {
            // Update Status Booking
            await tx.booking.update({
                where: { id: order_id },
                data: { 
                    status: finalBookingStatus,
                    // Jika sukses, tanggal lunas diisi
                    paidAt: finalBookingStatus === BookingStatus.PAID ? new Date() : undefined 
                },
            });

            // Update Status Payment
            await tx.payment.update({
                where: { id: currentPayment.id },
                data: { status: finalPaymentStatus, transactionId: notification.transaction_id }
            });
        });

        console.log(`[WEBHOOK] Successfully updated Booking ${order_id} to ${finalBookingStatus}`);
        
        // 5. Kirim Email Konfirmasi Pembayaran (Hanya jika PAID)
        if (finalBookingStatus === BookingStatus.PAID && booking.user.email) {
            const propertyName = booking.room?.property?.name || "Properti Anda";
            const checkInDate = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
            
            const htmlEmail = paymentSuccessTemplate(
                booking.user.firstName || "Guest",
                order_id,
                propertyName,
                checkInDate,
                gross_amount 
            );

            emailService.sendEmail(booking.user.email, "Pembayaran Berhasil! 🎉", htmlEmail);
        }
    }
  }

}