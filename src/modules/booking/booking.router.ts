import { Router } from "express";
import bookingController from "./booking.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

export const bookingRouter = () => {
    const router = Router();

    // router.use(verifyToken);

    router.post("/", bookingController.create);

    // // Route melihat daftar pesanan
    // // Method: GET
    // // URL akses: http://localhost:8000/api/v1/bookings/my-bookings
    router.get("/my-bookings", bookingController.getMyBookings);

    // // Route Cancel
    // // URL: http://localhost:8000/api/v1/bookings/:bookingId/cancel
    router.patch("/:bookingId/cancel", bookingController.cancelBooking);

    return router;
};
