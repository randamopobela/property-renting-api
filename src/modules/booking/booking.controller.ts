import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const bookingService = new BookingService();

export class BookingController {
  
  // ==========================================================
  // HELPER: Ambil User ID dari Token (Private Method)
  // ==========================================================
  private getUserIdFromToken(req: Request): string {
    const userData = (req as any).user;
    if (!userData) throw new Error("Unauthorized: User data missing from token");
    return userData.id || userData.userId || userData.user_id;
  }

  // 1. Create Booking
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // ❌ JANGAN HARDCODE ID!
      // ✅ Ambil dari Token User yang sedang login
      const userId = this.getUserIdFromToken(req);
      
      const result = await bookingService.createBooking(userId, req.body);
      res.status(201).json({ message: "Booking created", data: result });
    } catch (error: any) {
      next(error);
    }
  }

  // 2. Get My Bookings (Logic Debugging Anda sudah bagus, saya rapikan)
  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserIdFromToken(req);

      console.log(`✅ DEBUG Controller: Mengambil booking untuk User ID: ${userId}`);

      const bookings = await bookingService.getUserBookings(userId);

      res.status(200).json({
        message: "User bookings fetched",
        data: bookings
      });
    } catch (error) {
      next(error); // Lempar ke Error Handler global
    }
  }


  // 3. Get Room Detail (INI PERBAIKAN UTAMA UNTUK ERROR 500)
  async getRoomDetail(req: Request, res: Response, next: NextFunction) {
    try {
        const { roomId } = req.params;
        console.log("✅ Masuk ke getRoomDetail. ID:", roomId);
        
        // ❌ JANGAN Query Prisma manual di sini (Includenya kurang lengkap)
        // ✅ PANGGIL SERVICE yang baru saja kita perbaiki (includenya lengkap)
        const room = await bookingService.getRoomDetail(roomId);
        
        res.status(200).json({ message: "Success", data: room });
    } catch (error: any) {
        // Jika error "Room detail not found", kirim 404
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
  }

  // 4. Get Booking By ID
  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
        const { bookingId } = req.params;
        
        // Validasi sederhana
        if (!bookingId || bookingId === "undefined") {
            return res.status(400).json({ message: "Invalid Booking ID" });
        }
        
        // Boleh pakai Prisma langsung di sini jika belum ada servicenya,
        // Tapi pastikan include-nya cukup untuk kebutuhan frontend
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { 
                room: { include: { property: true } },
                payments: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Success", data: booking });
    } catch (error: any) {
        next(error);
    }
  }

  // 5. Upload Payment
  async uploadPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const file = req.file;
      
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      const filePath = `/images/${file.filename}`;
      
      const result = await bookingService.processPaymentUpload(bookingId, filePath);

      res.status(200).json({ message: "Upload success", data: result });
    } catch (error: any) {
      next(error);
    }
  }

  // 6. Cancel Booking
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
        const { bookingId } = req.params;
        
        // ❌ JANGAN HARDCODE ID!
        // ✅ Ambil dari Token agar user tidak bisa cancel punya orang lain
        const userId = this.getUserIdFromToken(req);
        
        const result = await bookingService.cancelBooking(bookingId, userId);
        res.status(200).json({ message: "Cancelled", data: result });
    } catch (error: any) {
        next(error);
    }
  }
}

