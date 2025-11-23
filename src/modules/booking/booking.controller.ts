import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../helpers/response.handler";
import bookingService from "./booking.service";

class BookingController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await bookingService.createBooking(req, next);
            responseHandler(res, "Booking successfuly created", data);
        } catch (error) {
            next(error);
        }
    }

    async getMyBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await bookingService.getMyBookings(req, next);
            responseHandler(res, "Booking data successfully fetched", data);
        } catch (error) {
            next(error);
        }
    }

    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await bookingService.cancelBooking(req, next);
            responseHandler(res, "Your booking successfully canceled", data);
        } catch (error) {
            next(error);
        }
    }

    async getBookingById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await bookingService.getBookingById(req, next);
            responseHandler(res, "Your booking successfully fetched", data);
        } catch (error) {
            next(error);
        }
    }
}

export default new BookingController();
