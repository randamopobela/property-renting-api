import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/booking.controller';
import { uploader } from '../middlewares/uploader';
import { uploadPaymentProof } from '../controllers/payment.controller';

const bookingRouter = Router();

bookingRouter.post('/', createBooking); 

// Route melihat daftar pesanan
// Method: GET
// URL akses: http://localhost:8000/api/bookings/my-bookings
bookingRouter.get('/my-bookings', getMyBookings);

// Route Upload Pembayaran
// URL: /api/bookings/:bookingId/payment
// 'paymentProof' adalah nama field key
bookingRouter.post('/:bookingId/payment', uploader.single('paymentProof'), uploadPaymentProof);

// Route Cancel
// URL: http://localhost:8000/api/bookings/:bookingId/cancel
bookingRouter.patch('/:bookingId/cancel', cancelBooking);

export default bookingRouter;