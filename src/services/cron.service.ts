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
    cron.schedule("* * * * *", async () => {
        // console.log("🔍 Checking for expired bookings...");
        
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
    cron.schedule("0 9 * * *", async () => {
        console.log("💌 Sending H-1 Reminders...");

        try {
            // Hitung Tanggal Besok
            const tomorrow = addDays(new Date(), 1);
            const startOfTomorrow = startOfDay(tomorrow);
            const endOfTomorrow = endOfDay(tomorrow);

            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    status: BookingStatus.PAID,
                    checkIn: {
                        gte: startOfTomorrow,
                        lte: endOfTomorrow
                    }
                },
                include: {
                    user: true,
                    room: { include: { property: true } }
                }
            });

            console.log(`Found ${upcomingBookings.length} bookings for tomorrow.`);

            // Kirim Email satu per satu
            for (const booking of upcomingBookings) {
                if (booking.user.email) {
                    const checkInStr = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
                    
                    const html = reminderEmailTemplate(
                        booking.user.firstName || "Guest",
                        booking.room.property.name,
                        checkInStr
                    );

                    await emailService.sendEmail(booking.user.email, "Pengingat Check-in H-1 🎒", html);
                }
            }

        } catch (error) {
            console.error("🔥 Error in Reminder Job:", error);
        }
    });
  }
}

export default new CronService();