import { Router } from 'express';
import { getTenantBookings, verifyPayment } from '../controllers/tenant.controller';

const tenantRouter = Router();

// GET Dashboard Tenant
tenantRouter.get('/bookings', getTenantBookings);

// POST Approve/Reject Payment
// URL: /api/tenant/bookings/:bookingId/verify
tenantRouter.post('/bookings/:bookingId/verify', verifyPayment);

export default tenantRouter;