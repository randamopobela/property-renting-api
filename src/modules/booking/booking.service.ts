import { PrismaClient, BookingStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma'; // Sesuaikan path relative
import { CreateBookingRequest } from '../../types/booking.type';
import { emailService } from '../../services/email.service';
import { paymentReceivedTemplate } from '../../helpers/emailTemplates';
import { PaymentService } from '../payment/payment.service';

const prisma = new PrismaClient();
const paymentService = new PaymentService();
export class BookingService {
  
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
            data: {
                userId, 
                roomId, 
                checkIn: start, 
                checkOut: end, 
                nights, 
                guests,
                amount: totalAmount, 
                method: PaymentMethod.GATEWAY, 
                status: BookingStatus.PENDING, 
                expireAt: expireDate
            }
        });

        const midtrans = await paymentService.createTransaction(booking.id, totalAmount, {
            firstName: user.firstName || "Guest",
            email: user.email,
            phone: user.phone || "08123456789" 
        });

        await tx.payment.create({
            data: {
                bookingId: booking.id,
                amount: totalAmount,
                method: PaymentMethod.GATEWAY,
                status: PaymentStatus.WAITING,
                snapToken: midtrans.token,     
                snapRedirectUrl: midtrans.redirect_url
            }
        });

        // Return data booking digabung dengan snapToken agar Frontend bisa langsung pakai
        return { ...booking, snapToken: midtrans.token };
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

    async processPaymentUpload(bookingId: string, filePath: string) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true }
    });

    if (!booking) throw new Error("Booking not found");

    const result = await prisma.$transaction(async (tx) => {
        await tx.booking.update({
            where: { id: bookingId },
            data: { 
                status: BookingStatus.AWAITING_CONFIRMATION,
                method: PaymentMethod.TRANSFER 
            },
        });

        return await tx.payment.upsert({
            where: { bookingId: bookingId },
            update: {
                proofUrl: filePath,
                method: PaymentMethod.TRANSFER,
                status: PaymentStatus.WAITING,
                updatedAt: new Date()
            },
            create: {
                bookingId: bookingId,
                amount: booking.amount,
                proofUrl: filePath,
                method: PaymentMethod.TRANSFER,
                status: PaymentStatus.WAITING
            },
        });
    });

    if (booking.user && booking.user.email) {
        const htmlEmail = paymentReceivedTemplate(booking.user.firstName || "Guest", booking.id);
        emailService.sendEmail(booking.user.email, "Pembayaran Sedang Diverifikasi", htmlEmail);
    }

    return result;
  }

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

  async getRoomDetail(roomId: string) {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                // Wajib: Ambil properti yang terhubung ke kamar
                property: {
                    include: {
                        // Wajib: Ambil tenant yang terhubung ke properti
                        tenant: {
                            // Wajib: Ambil user tenant (untuk kontak, dll.)
                            include: { user: true } 
                        },
                        pictures: true // Ambil gambar jika ada
                    }
                }
            }
        });

        if (!room) {
            throw new Error("Room detail not found.");
        }
        
        return room;
    }

}


