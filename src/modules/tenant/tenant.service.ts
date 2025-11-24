import { PrismaClient, BookingStatus } from '../../generated/prisma'; // Sesuaikan path ke generated prisma Anda

const prisma = new PrismaClient();

// 👇 PASTIKAN ADA KATA 'export' DI SINI
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
        payments: true  // Bukti Bayar
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
      include: { payments: true }
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
