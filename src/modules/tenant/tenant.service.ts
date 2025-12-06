import { PrismaClient, Prisma, BookingStatus } from '../../generated/prisma'; 
import { emailService } from "../../services/email.service";
import { bookingConfirmedTemplate, paymentRejectedTemplate } from "../../helpers/emailTemplates";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PaginationParams, PaginatedResponse } from '../../types/pagination.type'; 

const prisma = new PrismaClient();

export class TenantService {
  async getTenantBookings(tenantUserId: string, params: PaginationParams): Promise<PaginatedResponse<any>> {
    const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        status,
        startDate,
        endDate
    } = params;

    const skip = (page - 1) * limit;
    const whereClause: Prisma.BookingWhereInput = {
      room: {
        property: {
          tenant: { userId: tenantUserId }
        }
      }
    };

    if (status && status !== 'ALL') {
        whereClause.status = status as BookingStatus;
    }

    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }

    const [data, total] = await prisma.$transaction([
        prisma.booking.findMany({
            where: whereClause,
            skip: skip,
            take: Number(limit),
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                room: { include: { property: true } },
                user: true,
                payments: true,
                review: true
            }
        }),
        prisma.booking.count({ where: whereClause })
    ]);

    return {
        data,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
  }

  async verifyPayment(bookingId: string, tenantUserId: string, data: { action: "APPROVE" | "REJECT" }) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        room: { property: { tenant: { userId: tenantUserId } } }
      },
      include: { 
          payments: true,
          user: true, 
          room: { include: { property: true } } 
      }
    });

    if (!booking) throw new Error("Booking not found or unauthorized");
    
    if (booking.status !== BookingStatus.AWAITING_CONFIRMATION) {
        throw new Error("Booking is not waiting for confirmation");
    }

    const paymentList = booking.payments as any;
    const paymentId = Array.isArray(paymentList) && paymentList.length > 0 
        ? paymentList[0].id 
        : (paymentList?.id || null);

    if (data.action === 'APPROVE') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PAID } 
        });

        if (paymentId) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { approvedBy: tenantUserId, approvedAt: new Date() }
            });
        }

        if (booking.user && booking.user.email) {
            const checkInDate = format(new Date(booking.checkIn), "dd MMMM yyyy", { locale: id });
            
            const htmlEmail = bookingConfirmedTemplate(
                booking.user.firstName || "Guest",
                booking.id, 
                booking.room.property.name,
                checkInDate
            );

            emailService.sendEmail(booking.user.email, "Booking Confirmed! ✅", htmlEmail);
        }

        return { status: "APPROVED" };

    } else if (data.action === 'REJECT') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PENDING,
                expireAt: new Date(Date.now() + 60 * 60 * 1000)
             }
        });

        if (paymentId) {
             await prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'WAITING' }
            });
        }

        if (booking.user && booking.user.email) {
            const guestName = booking.user.firstName || "Guest";
            const htmlEmail = paymentRejectedTemplate(guestName, booking.id);

            emailService.sendEmail(
                booking.user.email, 
                "⚠️ Bukti Pembayaran Ditolak", 
                htmlEmail
            );
            console.log(`✉️ Email penolakan terkirim ke: ${booking.user.email}`);
        }
        return { status: "REJECTED_TO_PENDING" };
    } else {
        throw new Error("Invalid action");
    }
  }
}