import { PrismaClient, BookingStatus } from '../../generated/prisma'; 
// 👇 Import Email Service & Template
import { emailService } from "../../services/email.service";
import { bookingConfirmedTemplate } from "../../helpers/emailTemplates";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const prisma = new PrismaClient();

export class TenantService {

  // Service: Ambil Semua Pesanan Milik Tenant
  async getTenantBookings(tenantUserId: string) {
    return await prisma.booking.findMany({
      where: {
        room: {
          property: {
            tenant: {
              userId: tenantUserId 
            }
          }
        }
      },
      include: {
        room: {
          include: { property: true }
        },
        user: true,     
        payments: true,  
        review: true   
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Service: Verifikasi Pembayaran (Approve/Reject)
  async verifyPayment(bookingId: string, tenantUserId: string, data: { action: "APPROVE" | "REJECT" }) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        room: { property: { tenant: { userId: tenantUserId } } }
      },
      include: { 
          payments: true,
          user: true, 
          room: { include: { property: true } } 
      }
    });

    if (!booking) throw new Error("Booking not found or unauthorized");
    
    if (booking.status !== BookingStatus.AWAITING_CONFIRMATION) {
        throw new Error("Booking is not waiting for confirmation");
    }

    // --- FIX ERROR TYPE SCRIPT ---
    // Kita ambil payment dengan aman. Gunakan 'any' sementara untuk bypass kebingungan Array vs Object
    const paymentList = booking.payments as any;
    const paymentId = Array.isArray(paymentList) && paymentList.length > 0 
        ? paymentList[0].id 
        : (paymentList?.id || null);

    // 2. Eksekusi Action
    if (data.action === 'APPROVE') {
        // Update Booking jadi PAID
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PAID } 
        });

        // Catat siapa yang approve (Cek jika payment ada)
        if (paymentId) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { approvedBy: tenantUserId, approvedAt: new Date() }
            });
        }

        // 👇 KIRIM EMAIL KONFIRMASI KE USER
        // FIX: Tambahkan || "Guest" untuk menangani jika firstName null
        if (booking.user && booking.user.email) {
            const checkInDate = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
            
            const htmlEmail = bookingConfirmedTemplate(
                booking.user.firstName || "Guest", // <--- FIX ERROR DI SINI
                booking.id, 
                booking.room.property.name,
                checkInDate
            );

            emailService.sendEmail(booking.user.email, "Booking Confirmed! ✅", htmlEmail);
        }

        return { status: "APPROVED" };

    } else if (data.action === 'REJECT') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PENDING }
        });
        
        return { status: "REJECTED_TO_PENDING" };
    } else {
        throw new Error("Invalid action");
    }
  }
}
