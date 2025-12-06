import { Router } from 'express';
import { ReportController } from './report.controller';
import { verify } from 'crypto';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();
const reportController = new ReportController();

// 1. Sales Report
// URL: GET http://localhost:8000/api/reports/sales
router.get('/sales', verifyToken, reportController.getSales.bind(reportController));

// 2. Availability Report
// URL: GET http://localhost:8000/api/reports/calendar
router.get('/calendar', verifyToken, reportController.getAvailability.bind(reportController));
export default router;