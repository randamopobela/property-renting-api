import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const bookingService = new BookingService();

export class BookingController {
  
  // 1. Create Booking
  async create(req: Request, res: Response) {
    try {
      const userId = "user-buyer-001"; // ID Hardcode (Ganti req.user.id nanti)
      const result = await bookingService.createBooking(userId, req.body);
      res.status(201).json({ message: "Booking created", data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 2. Get My Bookings
  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = "user-buyer-001"; // ID Hardcode
      const bookings = await bookingService.getUserBookings(userId);
      res.status(200).json({ message: "Success", data: bookings });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 3. Get Room Detail (Helper untuk Frontend)
  async getRoomDetail(req: Request, res: Response) {
    try {
        console.log("✅ Masuk ke getRoomDetail. ID:", req.params.roomId);
        const { roomId } = req.params;
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { property: { include: { pictures: true } } }
        });
        
        if (!room) return res.status(404).json({ message: "Room not found" });
        
        res.status(200).json({ message: "Success", data: room });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }

  // 4. Get Booking By ID
  async getBookingById(req: Request, res: Response) {
    try {
        const { bookingId } = req.params;
        console.log("🔍 Mencari Booking ID:", bookingId);

        // Validasi input sederhana
        if (!bookingId || bookingId === "undefined") {
            return res.status(400).json({ message: "Invalid Booking ID" });
        }
        
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { 
                room: { include: { property: true } },
                payments: true // Include payments biar tau status bayar
            }
        });

        // SAFETY CHECK: Jika null, jangan lanjut, langsung return 404
        if (!booking) {
            console.error("❌ Booking tidak ditemukan di database!");
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Success", data: booking });
    } catch (error: any) {
        console.error("🔥 Error getBookingById:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  // 5. Upload Payment (INI YANG TADI HILANG)
  async uploadPayment(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const file = req.file;
      
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      // Perhatikan path-nya, pastikan pakai slash /images/
      const filePath = `/images/${file.filename}`;
      
      const result = await bookingService.processPaymentUpload(bookingId, filePath);

      res.status(200).json({ message: "Upload success", data: result });
    } catch (error: any) {
      // 👇 PERBAIKAN DI SINI
      console.error("🔥 Upload Error:", error);
      
      // Cek apakah error.code itu angka? Kalau bukan, pakai 500
      const statusCode = typeof error.code === 'number' ? error.code : 500;
      
      res.status(statusCode).json({ 
        message: error.message || "Internal Server Error" 
      });
    }
  }

  // 6. Cancel Booking (INI JUGA YANG TADI HILANG)
  async cancel(req: Request, res: Response) {
    try {
        const { bookingId } = req.params;
        const userId = "user-buyer-001"; // Hardcode ID
        
        const result = await bookingService.cancelBooking(bookingId, userId);
        res.status(200).json({ message: "Cancelled", data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
  }
}

