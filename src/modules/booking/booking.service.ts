import { PrismaClient, PaymentMethod, BookingStatus } from '../../generated/prisma';
import { CreateBookingRequest } from '../../types/booking.type';

const prisma = new PrismaClient();

// 👇 PASTIKAN ADA KATA 'export' DI SINI
export class BookingService {
  
  // Service: Hitung harga & Buat Booking
  async createBooking(userId: string, data: CreateBookingRequest) {
    const { roomId, checkIn, checkOut, guests } = data;

    // Logic Hitung Malam
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Cek Room & Harga
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");

    const totalAmount = room.basePrice * nights;
    
    // Set Expire 2 Jam
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

  // Service: Ambil Booking User
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

  // Service: Upload Payment
  async processPaymentUpload(bookingId: string, filePath: string) {
    // Gunakan Transaction
    return await prisma.$transaction(async (tx) => {
        // Update Status
        await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.AWAITING_CONFIRMATION }
        });
        
        // Upsert Payment
        return await tx.payment.upsert({
            where: { bookingId },
            update: { proofUrl: filePath, updatedAt: new Date() },
            create: { bookingId, proofUrl: filePath }
        });
    });
  }

  // Service: Cancel Booking
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
