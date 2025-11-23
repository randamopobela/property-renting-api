import cron from "node-cron";
import { BookingStatus } from "../generated/prisma";
import { prisma } from "../config/env";

export const startCronJob = () => {
    try {
        cron.schedule("* * * * *", async () => {
            console.log("🤖 CRON JOB: Checking for expired bookings...");

            const now = new Date();

            const expiredBookings = await prisma.booking.updateMany({
                where: {
                    status: BookingStatus.PENDING,
                    expireAt: {
                        lt: now,
                    },
                },
                data: {
                    status: BookingStatus.CANCELLED,
                },
            });

            if (expiredBookings.count > 0) {
                console.log(
                    `✅ CRON JOB: Cancelled ${expiredBookings.count} expired bookings.`
                );
            }
        });
    } catch (error) {
        console.error("❌ CRON JOB ERROR:", error);
    }
};
