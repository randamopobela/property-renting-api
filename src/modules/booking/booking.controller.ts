import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { PrismaClient } from '../../generated/prisma';
import { NextFunction } from 'express';

const prisma = new PrismaClient();
const bookingService = new BookingService();

export class BookingController {
  
  // 1. Create Booking
  async create(req: Request, res: Response) {
    try {
      const userId = "cmir6p5q10003bp7b6mdz43i2"; // ID Hardcode (Ganti req.user.id nanti)
      const result = await bookingService.createBooking(userId, req.body);
      res.status(201).json({ message: "Booking created", data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 2. Get My Bookings
  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Cek dulu apakah req.user ada (Middleware Auth bekerja)
      if (!(req as any).user) {
        // Ini terjadi jika Auth Middleware belum dipasang atau gagal
        console.log(`\n=================================================`);
        console.log(`❌ ERROR: req.user is UNDEFINED. Check Auth Middleware.`);
        console.log(`=================================================\n`);
        return res.status(401).json({ message: "Unauthorized: Token required or expired." });
      }

      // 2. Ambil ID dengan mencoba nama field yang berbeda (untuk kompatibilitas)
      const userData = (req as any).user;
      // Coba ambil ID dari field yang mungkin ada di JWT: .id, .userId, atau .user_id
      const userId = userData.id || userData.userId || userData.user_id;

      // 👇 KODE DEBUGGING KRUSIAL
      console.log(`\n=================================================`);
      console.log(`✅ DEBUG: Controller MyBookings ter-trigger.`);
      console.log(`✅ DEBUG: User ID yang terdeteksi dari Token: ${userId}`);
      console.log(`=================================================\n`);
      // 👆 AKHIR KODE DEBUGGING

      if (!userId) {
        // Jika semua field ID dicoba tapi tetap null
        return res.status(401).json({ message: "Unauthorized: User ID not found in token payload." });
      }

      // Memanggil service untuk mengambil data booking
      const bookings = await bookingService.getUserBookings(userId);

      res.status(200).json({
        message: "User bookings fetched",
        data: bookings
      });
    } catch (error) {
      next(error);
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
      console.error("🔥 Upload Error:", error);
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
        const userId = "cmir6p5q10003bp7b6mdz43i2"; // Hardcode ID
        
        const result = await bookingService.cancelBooking(bookingId, userId);
        res.status(200).json({ message: "Cancelled", data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
  }
}

