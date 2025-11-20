import { Request, Response } from 'express';
import { PrismaClient, BookingStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const file = req.file;

    // 1. Validasi File
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.AWAITING_CONFIRMATION } 
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: bookingId,
          proofUrl: `/images/${file.filename}`, 
        }
      });

      return payment;
    });

    return res.status(200).json({
      message: "Bukti pembayaran berhasil diupload",
      data: result
    });

  } catch (error) {
    console.error("Error upload payment:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
};