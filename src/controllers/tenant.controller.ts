import { Request, Response } from 'express';
import { PrismaClient, BookingStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export const getTenantBookings = async (req: Request, res: Response) => {
  try {
    const tenantUserId = "user-tenant-1"; 

    const bookings = await prisma.booking.findMany({
      where: {
        room: {
          property: {
            tenant: {
              userId: tenantUserId
            }
          }
        }
      },
      include: {
        room: {
          include: { property: true } 
        },
        user: true,
        payments: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      message: "Data pesanan tenant berhasil diambil",
      data: bookings
    });

  } catch (error) {
    console.error("Error getTenantBookings:", error);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body;
    const tenantUserId = "user-tenant-1";

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        room: { property: { tenant: { userId: tenantUserId } } }
      },
      include: { payments: true }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    if (booking.status !== BookingStatus.AWAITING_CONFIRMATION) {
      return res.status(400).json({ message: "Booking status is not waiting for confirmation" });
    }

    if (action === 'APPROVE') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
            status: BookingStatus.PAID
        }
      });
      
      if (booking.payments[0]) {
          await prisma.payment.update({
              where: { id: booking.payments[0].id },
              data: { 
                  approvedBy: tenantUserId,
                  approvedAt: new Date()
              }
          })
      }

      return res.status(200).json({ message: "Payment Approved!" });

    } else if (action === 'REJECT') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.PENDING } 
      });

      return res.status(200).json({ message: "Payment Rejected. User asked to re-upload." });
    } else {
      return res.status(400).json({ message: "Invalid action. Use APPROVE or REJECT" });
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Error processing payment" });
  }
};