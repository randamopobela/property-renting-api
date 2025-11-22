import cron from 'node-cron';
import { PrismaClient, BookingStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export const startCronJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('🤖 CRON JOB: Checking for expired bookings...');

    const now = new Date();

    const expiredBookings = await prisma.booking.updateMany({
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

    if (expiredBookings.count > 0) {
      console.log(`✅ CRON JOB: Cancelled ${expiredBookings.count} expired bookings.`);
    }
  });
};