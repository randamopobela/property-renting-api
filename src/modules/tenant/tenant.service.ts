import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/env";
import { ErrorHandler } from "../../helpers/response.handler";
import { BookingStatus } from "../../generated/prisma";

class TenantService {
    async getTenantBookings(req: Request, next: NextFunction) {
        try {
            const tenantUserId = "user-tenant-1";

            const bookings = await prisma.booking.findMany({
                where: {
                    room: {
                        property: {
                            tenant: {
                                userId: tenantUserId,
                            },
                        },
                    },
                },
                include: {
                    room: {
                        include: { property: true },
                    },
                    user: true,
                    payments: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return bookings;
        } catch (error) {
            console.error("Error getTenantBookings:", error);
            next(error);
        }
    }

    async verifyPayment(req: Request, next: NextFunction) {
        try {
            const { bookingId } = req.params;
            const { action } = req.body;
            const tenantUserId = "user-tenant-1";

            const booking = await prisma.booking.findFirst({
                where: {
                    id: bookingId,
                    room: { property: { tenant: { userId: tenantUserId } } },
                },
                include: { payments: true },
            });

            if (!booking) {
                throw new ErrorHandler(
                    "Booking not found or unauthorized",
                    404
                );
            }

            if (booking.status !== BookingStatus.AWAITING_CONFIRMATION) {
                throw new ErrorHandler(
                    "Booking status is not awaiting confirmation",
                    400
                );
            }

            if (action === "APPROVE") {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: BookingStatus.PAID,
                    },
                });

                if (booking.payments[0]) {
                    await prisma.payment.update({
                        where: { id: booking.payments[0].id },
                        data: {
                            approvedBy: tenantUserId,
                            approvedAt: new Date(),
                        },
                    });
                }
            } else if (action === "REJECT") {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: { status: BookingStatus.PENDING },
                });
            } else {
                throw new ErrorHandler(
                    "Invalid action. Use APPROVE or REJECT",
                    400
                );
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            next(error);
        }
    }
}

export default new TenantService();
