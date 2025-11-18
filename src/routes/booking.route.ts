import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller';

const bookingRouter = Router();

bookingRouter.post('/', createBooking); 

// Route melihat daftar pesanan
// Method: GET
// URL akses: http://localhost:8000/api/bookings/my-bookings
bookingRouter.get('/my-bookings', getMyBookings);

export default bookingRouter;