import { Request, Response } from 'express';
import { ReportService } from './report.service';
import { NextFunction } from 'express';

const reportService = new ReportService();

export class ReportController {

  // GET /api/reports/sales?start=2025-01-01&end=2025-01-31
  async getSales(req: Request, res: Response, next: NextFunction) {
    try {
      // 👇 FIX: Ambil ID Tenant dari Token (Dynamic)
      const user = (req as any).user;
      if (!user) throw new Error("Unauthorized");
      
      const tenantUserId = user.id || user.userId || user.user_id;

      console.log(`📊 Report Debug: Fetching data for Tenant User ID: ${tenantUserId}`);

      // Query params (opsional, untuk filter tanggal dashboard)
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const data = await reportService.getSalesReport(tenantUserId, startDate, endDate);
      
      res.status(200).json({
        message: "Sales report fetched",
        data
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reports/availability
  async getAvailability(req: Request, res: Response) {
    try {
        // TODO: Ganti dengan req.user.id nanti
        const user = (req as any).user;
        if (!user) throw new Error("Unauthorized");
      
        const tenantUserId = user.id || user.userId || user.user_id;
        const { propertyId } = req.query;

        const data = await reportService.getAvailabilityReport(tenantUserId, propertyId as string);
        
        res.status(200).json({ message: "Availability report fetched", data });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }
}