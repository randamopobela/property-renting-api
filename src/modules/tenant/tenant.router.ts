import { Router } from "express";
import tenantController from "./tenant.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

export const tenantRouter = () => {
    const router = Router();

    // router.use(verifyToken);

    // GET Dashboard Tenant
    router.get("/bookings", tenantController.getTenantBookings);

    // POST Approve/Reject Payment
    // URL: /api/tenant/bookings/:bookingId/verify
    router.post("/bookings/:bookingId/verify", tenantController.verifyPayment);

    return router;
};

// import { getTenantBookings, verifyPayment } from '../controllers/tenant.controller';
