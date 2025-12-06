import { Router } from "express";
import { TenantController } from "./tenant.controller";
import { verifyToken } from "../../middlewares/auth.middleware"; // Uncomment jika Auth sudah siap

const router = Router();
const tenantController = new TenantController();

// router.use(verifyToken);

// GET Dashboard Tenant
// Perbaikan: Menggunakan method 'getDashboard' yang baru
router.get('/bookings', 
    verifyToken,
    tenantController.getDashboard.bind(tenantController)
);

// POST Approve/Reject Payment
// URL: /api/tenant/bookings/:bookingId/verify
router.post('/bookings/:bookingId/verify', 
    verifyToken,
    tenantController.verifyPayment.bind(tenantController)
);

export default router;
