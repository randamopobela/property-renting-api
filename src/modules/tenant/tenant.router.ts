import { Router } from "express";
import tenantController from "./tenant.controller";
// import { verifyToken } from "../../middlewares/auth.middleware"; // Uncomment jika Auth sudah siap

const router = Router();

// router.use(verifyToken);

// GET Dashboard Tenant
// Perbaikan: Menggunakan method 'getDashboard' yang baru
router.get("/bookings", tenantController.getDashboard);

// POST Approve/Reject Payment
// URL: /api/tenant/bookings/:bookingId/verify
router.post("/bookings/:bookingId/verify", tenantController.verifyPayment);

export default router;
