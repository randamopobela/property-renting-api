import cron from "node-cron";
import { PrismaClient, BookingStatus } from "../generated/prisma";
import { emailService } from "./email.service";
import { reminderEmailTemplate } from "../helpers/emailTemplates";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { id } from "date-fns/locale";

const prisma = new PrismaClient();

class CronService {
  init() {
    console.log("⏰ Cron Service Initialized");
    
    this.scheduleAutoCancel();
    this.scheduleCheckInReminder();
  }

  private scheduleAutoCancel() {
    // Berjalan setiap 1 menit (sesuai * * * * *)
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const result = await prisma.booking.updateMany({
                where: {
                    status: BookingStatus.PENDING,
                    expireAt: {
                        lt: now 
                    }
                },
                data: {
                    status: BookingStatus.CANCELLED
                }
            });

            if (result.count > 0) {
                console.log(`✅ Auto-Cancelled ${result.count} expired bookings.`);
            }
        } catch (error) {
            console.error("🔥 Error in Auto-Cancel Job:", error);
        }
    });
  } 

  // JOB 2: REMINDER H-1 (Setiap Jam 09:00 Pagi)
  private scheduleCheckInReminder() {
    // Berjalan setiap hari pada jam 9 pagi
    cron.schedule("0 9 * * *", async () => { 
        console.log("💌 Sending H-1 Reminders...");

        try {
            // Hitung rentang waktu Besok
            const tomorrow = addDays(new Date(), 1);
            const startOfTomorrow = startOfDay(tomorrow);
            const endOfTomorrow = endOfDay(tomorrow);

            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    status: BookingStatus.PAID,
                    checkIn: {
                        gte: startOfTomorrow, // Mulai besok (00:00)
                        lte: endOfTomorrow // Sampai akhir besok (23:59)
                    }
                },
                include: {
                    user: true,
                    // Pastikan relasi Property ter-include untuk nama properti di email
                    room: { include: { property: true } } 
                }
            });

            console.log(`Found ${upcomingBookings.length} PAID bookings checking in tomorrow.`);

            // Kirim Email satu per satu
            for (const booking of upcomingBookings) {
                // Tambahan: Pastikan email template yang digunakan adalah yang benar (reminderEmailTemplate)
                if (booking.user.email && booking.room?.property) {
                    const checkInStr = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
                    
                    const html = reminderEmailTemplate(
                        booking.user.firstName || "Guest",
                        booking.room.property.name,
                        checkInStr
                    );

                    console.log(`✉️ Attempting to send reminder for Booking ID: ${booking.id} to ${booking.user.email}`);
                    
                    await emailService.sendEmail(booking.user.email, "Pengingat Check-in H-1 🎒", html);
                    console.log(`Sent reminder email to ${booking.user.email} for booking ${booking.id}.`);
                } else {
                    console.warn(`⚠️ Skipping reminder for booking ${booking.id}: Missing email or property data.`);
                }
            }

        } catch (error) {
            console.error("🔥 Error in Reminder Job:", error);
        }
    });
  }
}

export default new CronService();