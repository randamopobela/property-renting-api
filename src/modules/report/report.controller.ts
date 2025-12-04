import { Request, Response } from 'express';
import { ReportService } from './report.service';

const reportService = new ReportService();

export class ReportController {

  // GET /api/reports/sales?start=2025-01-01&end=2025-01-31
  async getSales(req: Request, res: Response) {
    try {
        // TODO: Ganti dengan req.user.id nanti
        const tenantUserId = "cmir6p5mw0000bp7b6b0f85da"; 
        
        const { start, end } = req.query;

        const data = await reportService.getSalesReport(
            tenantUserId, 
            start as string, 
            end as string
        );
        
        res.status(200).json({ message: "Sales report fetched", data });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }

  // GET /api/reports/availability
  async getAvailability(req: Request, res: Response) {
    try {
        // TODO: Ganti dengan req.user.id nanti
        const tenantUserId = "cmir6p5mw0000bp7b6b0f85da"; 
        const { propertyId } = req.query;

        const data = await reportService.getAvailabilityReport(tenantUserId, propertyId as string);
        
        res.status(200).json({ message: "Availability report fetched", data });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }
}