import { Router } from 'express';
// 👇 PERHATIKAN: Pakai kurung kurawal { }
import { BookingController } from './booking.controller'; 
import { uploader } from '../../middlewares/uploader.middleware';

const router = Router();

// 👇 INSTANSIASI CLASS (Ini yang tadi error)
// Karena kita import Class-nya, sekarang kita bisa pakai 'new'
const bookingController = new BookingController(); 

// --- 1. Route Spesifik (HARUS DI ATAS) ---
router.post('/', bookingController.create.bind(bookingController));
router.get('/my-bookings', bookingController.getMyBookings.bind(bookingController));
router.get('/room/:roomId', bookingController.getRoomDetail.bind(bookingController));

// --- 2. Route Dinamis (HARUS DI BAWAH) ---
router.get('/:bookingId', bookingController.getBookingById.bind(bookingController));
router.post(
  '/:bookingId/payment', 
  // Execute uploader dulu:
  uploader("TRX", "payment-proofs").single('paymentProof'), 
  bookingController.uploadPayment.bind(bookingController)
);
router.patch('/:bookingId/cancel', bookingController.cancel.bind(bookingController));

export default router;
