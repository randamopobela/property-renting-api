import { PrismaClient, BookingStatus } from '../../generated/prisma'; // Sesuaikan path ke generated prisma Anda
import { emailService } from '../../services/email.service';
import { bookingConfirmedTemplate } from '../../helpers/emailTemplates';
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
              userId: tenantUserId // Query Relasi: Cari booking di properti milik tenant ini
            }
          }
        }
      },
      include: {
        room: {
          include: { property: true }
        },
        user: true,     // Data Penyewa
        payments: true,
        review: true  // Bukti Bayar
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Service: Verifikasi Pembayaran (Approve/Reject)
  async verifyPayment(bookingId: string, tenantUserId: string, data: { action: "APPROVE" | "REJECT" }) {
    // 1. Validasi: Pastikan booking ini milik tenant yang sedang login
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        room: { property: { tenant: { userId: tenantUserId } } }
      },
      include: { payments: true,
        user: true,
        room: { include: { property: true } }
       }
    });

    if (!booking) throw new Error("Booking not found or unauthorized");
    
    // Validasi Status (Opsional: bisa dikomen kalau mau testing bebas)
    if (booking.status !== BookingStatus.AWAITING_CONFIRMATION) {
        throw new Error("Booking is not waiting for confirmation");
    }

    // 2. Eksekusi Action
    if (data.action === 'APPROVE') {
        // Update Booking jadi PAID
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PAID } 
        });

        // Catat siapa yang approve
        if (booking.payments[0]) {
            await prisma.payment.update({
                where: { id: booking.payments[0].id },
                data: { approvedBy: tenantUserId, approvedAt: new Date() }
            });
        }

        // 👇 KIRIM EMAIL KONFIRMASI KE USER
        if (booking.user && booking.user.email) {
            const checkInDate = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
            
            const htmlEmail = bookingConfirmedTemplate(
                booking.user.firstName, 
                booking.id, 
                booking.room.property.name,
                checkInDate
            );

            // Fire and forget (tidak perlu await agar tenant tidak menunggu loading email)
            emailService.sendEmail(booking.user.email, "Booking Confirmed! ✅", htmlEmail);
        }
        return { status: "APPROVED" };

    } else if (data.action === 'REJECT') {
        // Balikin ke PENDING biar user upload ulang
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PENDING }
        });
        return { status: "REJECTED" };
    } else {
        throw new Error("Invalid action");
    }
  }
}
