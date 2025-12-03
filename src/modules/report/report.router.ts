import { Router } from 'express';
import { ReportController } from './report.controller';

const router = Router();
const reportController = new ReportController();

// 1. Sales Report
// URL: GET http://localhost:8000/api/reports/sales
router.get('/sales', reportController.getSales.bind(reportController));

// 2. Availability Report
// URL: GET http://localhost:8000/api/reports/calendar
router.get('/calendar', reportController.getAvailability.bind(reportController));

export default router;