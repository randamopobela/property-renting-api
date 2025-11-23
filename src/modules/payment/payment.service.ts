import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/env";
import { BookingStatus, PaymentMethod } from "../../generated/prisma";
import { ErrorHandler } from "../../helpers/response.handler";

class PayementService {
    async uploadPaymentProof(req: Request, next: NextFunction) {
        try {
            const { bookingId } = req.params;
            const file = req.file;

            // 1. Validasi File
            if (!file) {
                throw new ErrorHandler("Payment proof file is required", 400);
            }
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) {
                throw new ErrorHandler("Booking not found", 404);
            }

            const result = await prisma.$transaction(async (tx) => {
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { status: BookingStatus.AWAITING_CONFIRMATION },
                });

                await tx.payment.create({
                    data: {
                        bookingId: bookingId,
                        proofUrl: `/images/${file.filename}`,
                    },
                });
            });

            return result;
        } catch (error) {
            console.error("Error upload payment:", error);
            next(error);
        }
    }
}

export default new PayementService();
