import { Router } from 'express';
import { BookingController } from './booking.controller';
// 👇 Pastikan import ini menggunakan kurung kurawal { } (Named Import)
import { uploader } from '../../middlewares/uploader.middleware';

const router = Router();
const bookingController = new BookingController();

// ============================================================
// ⚠️ ZONA KHUSUS (Static / Specific Routes) - WAJIB DI ATAS
// ============================================================

// 1. Create Booking
router.post('/', bookingController.create.bind(bookingController));

// 2. Get My Bookings
router.get('/my-bookings', bookingController.getMyBookings.bind(bookingController));

// 3. Get Room Detail
router.get('/room/:roomId', bookingController.getRoomDetail.bind(bookingController));


// ============================================================
// ⚠️ ZONA DINAMIS (Dynamic Routes) - WAJIB DI BAWAH
// ============================================================

// 4. Get Booking Detail
router.get('/:bookingId', bookingController.getBookingById.bind(bookingController));

// 5. Upload Payment
router.post(
  '/:bookingId/payment', 
  // 👇 Panggil Function uploader("PREFIX", "FOLDER")
  uploader("TRX", "images").single('paymentProof'), 
  bookingController.uploadPayment.bind(bookingController)
);

// 6. Cancel Booking
router.patch('/:bookingId/cancel', bookingController.cancel.bind(bookingController));

export default router;
