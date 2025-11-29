import { PrismaClient, BookingStatus, PaymentMethod } from '../../generated/prisma'; // Sesuaikan path relative
import { CreateBookingRequest } from '../../types/booking.type';
import { emailService } from '../../services/email.service';
import { paymentReceivedTemplate } from '../../helpers/emailTemplates';

const prisma = new PrismaClient();

export class BookingService {
  
  // Service 1: Create Booking
  async createBooking(userId: string, data: CreateBookingRequest) {
    const { roomId, checkIn, checkOut, guests } = data;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");

    const totalAmount = room.basePrice * nights;
    
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 2);

    return await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkIn: start,
        checkOut: end,
        nights,
        guests,
        amount: totalAmount,
        method: PaymentMethod.TRANSFER,
        status: BookingStatus.PENDING,
        expireAt: expireDate
      }
    });
  }

  // Service 2: Get User Bookings
  async getUserBookings(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        room: {
            include: { property: { include: { pictures: true } } }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Service 3: Upload Payment (SUDAH DIPERBAIKI)
  // Menggunakan parameter filePath (string) agar sesuai dengan Controller
  async processPaymentUpload(bookingId: string, filePath: string) {
    
    // 1. Cek Booking Ada atau Tidak
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // 2. Gunakan Transaction
    const result = await prisma.$transaction(async (tx) => {
        // A. Update Status Booking
        await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.AWAITING_CONFIRMATION },
        });

        // B. Upsert Payment
        // Menggunakan filePath string langsung
        return await tx.payment.upsert({
            where: { bookingId: bookingId },
            update: {
                proofUrl: filePath, 
                updatedAt: new Date()
            },
            create: {
                bookingId: bookingId,
                proofUrl: filePath,
            },
        });
    });

    // C. KIRIM EMAIL NOTIFIKASI (Side Effect)
    // Kita taruh di luar transaction agar kalau email gagal, booking tetap tersimpan.
    if (booking.user && booking.user.email) {
        const htmlEmail = paymentReceivedTemplate(booking.user.firstName, booking.id);
        
        // Fire and forget (tidak perlu await agar user tidak menunggu loading email)
        emailService.sendEmail(booking.user.email, "Pembayaran Sedang Diverifikasi", htmlEmail);
    }
    return result;
  }

  // Service 4: Cancel Booking
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== userId) throw new Error("Unauthorized");
    if (booking.status !== BookingStatus.PENDING) throw new Error("Cannot cancel non-pending booking");

    return await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED }
    });
  }
}
