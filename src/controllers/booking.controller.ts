import { Request, Response } from 'express';
import { PrismaClient, PaymentMethod, BookingStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
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
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const totalAmount = room.basePrice * nights;

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 2);

    // 5. Simpan ke Database
    const newBooking = await prisma.booking.create({
      data: {
        userId: userId,       // Pake ID hardcode
        roomId: roomId,
        checkIn: start,
        checkOut: end,
        nights: nights,
        guests: guests,
        amount: totalAmount,
        method: PaymentMethod.TRANSFER, // Default dulu
        status: BookingStatus.PENDING,
        expireAt: expireDate
      }
    });

    return res.status(201).json({
      message: "Booking successfully created!",
      data: newBooking
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create booking", error });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    // TODO: [AUTH-INTEGRATION] Ganti hardcode ini dengan req.user.id jika Auth sudah siap
    const userId = "user-buyer-001"; 

    const bookings = await prisma.booking.findMany({
      where: { 
        userId: userId 
      },
      include: {
        room: {
          include: {
            property: {
                include: {
                    pictures: true 
                }
            } 
          }
        },
        payments: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      message: "Daftar pesanan berhasil diambil",
      data: bookings
    });

  } catch (error) {
    console.error("Error getMyBookings:", error);
    return res.status(500).json({ message: "Gagal mengambil data pesanan", error });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    // TODO: [AUTH-INTEGRATION] Ganti hardcode ini dengan req.user.id jika Auth sudah siap
    const userId = "user-buyer-001"; // Pakai ID Hardcode yang sama

    // 1. Cari Booking-nya dulu
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Validasi Kepemilikan (Security)
    // User A tidak boleh cancel pesanan User B
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "You are not authorized to cancel this booking" });
    }

    // 3. Validasi Status (Business Logic)
    // Tidak boleh cancel kalau sudah dibayar atau sedang diproses
    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({ 
        message: "Cannot cancel booking. Status is not PENDING." 
      });
    }

    // 4. Update Status jadi CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        updatedAt: new Date()
      }
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      data: updatedBooking
    });

  } catch (error) {
    console.error("Error canceling booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};