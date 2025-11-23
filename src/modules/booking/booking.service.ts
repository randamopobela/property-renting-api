import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/env";
import { BookingStatus, PaymentMethod } from "../../generated/prisma";
import { ErrorHandler } from "../../helpers/response.handler";

class BookingService {
    async createBooking(req: Request, next: NextFunction) {
        try {
            // 1. HARDCODE USER ID (Sementara, karena Fitur Login teman belum jadi)
            // Ganti string di bawah dengan ID User A yang Anda copy dari Prisma Studio
            // TODO: [AUTH-INTEGRATION] Ganti hardcode ini dengan req.user.id jika Auth sudah siap
            const userId = "user-buyer-001";

            const { roomId, checkIn, checkOut, guests } = req.body;

            // 2. Validasi sederhana
            // (Nanti di sini kita cek apakah kamar tersedia di tanggal itu)

            // 3. Hitung total malam (Logic sederhana dulu)
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 4. Ambil harga kamar
            const room = await prisma.room.findUnique({
                where: { id: roomId },
            });

            if (!room) {
                throw new ErrorHandler("Room not found", 404);
            }

            const totalAmount = room.basePrice * nights;

            const expireDate = new Date();
            expireDate.setHours(expireDate.getHours() + 2);

            // 5. Simpan ke Database
            const newBooking = await prisma.booking.create({
                data: {
                    userId: userId, // Pake ID hardcode
                    roomId: roomId,
                    checkIn: start,
                    checkOut: end,
                    nights: nights,
                    guests: guests,
                    amount: totalAmount,
                    method: PaymentMethod.TRANSFER, // Default dulu
                    status: BookingStatus.PENDING,
                    expireAt: expireDate,
                },
            });

            return newBooking;
        } catch (error) {
            next(error);
        }
    }

    async getMyBookings(req: Request, next: NextFunction) {
        try {
            // TODO: [AUTH-INTEGRATION] Ganti hardcode ini dengan req.user.id jika Auth sudah siap
            const userId = "user-buyer-001";

            const bookings = await prisma.booking.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    room: {
                        include: {
                            property: {
                                include: {
                                    pictures: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return bookings;
        } catch (error) {
            console.error("Error di getMyBookings:", error);
            next(error);
        }
    }

    async cancelBooking(req: Request, next: NextFunction) {
        try {
            const { bookingId } = req.params;
            // TODO: [AUTH-INTEGRATION] Ganti hardcode ini dengan req.user.id jika Auth sudah siap
            const userId = "user-buyer-001"; // Pakai ID Hardcode yang sama

            // 1. Cari Booking-nya dulu
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) {
                throw new ErrorHandler("Booking not found", 404);
            }

            // 2. Validasi Kepemilikan (Security)
            // User A tidak boleh cancel pesanan User B
            if (booking.userId !== userId) {
                throw new ErrorHandler(
                    "You are not authorized to cancel this booking",
                    403
                );
            }

            // 3. Validasi Status (Business Logic)
            // Tidak boleh cancel kalau sudah dibayar atau sedang diproses
            if (booking.status !== BookingStatus.PENDING) {
                throw new ErrorHandler(
                    "Only pending bookings can be cancelled",
                    400
                );
            }

            // 4. Update Status jadi CANCELLED
            const updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.CANCELLED,
                    updatedAt: new Date(),
                },
            });

            return updatedBooking;
        } catch (error) {
            console.error("Error saat cancel booking:", error);
            next(error);
        }
    }
}

export default new BookingService();
