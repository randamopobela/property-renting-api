import { NextFunction, Request, Response } from "express";
import { TenantService } from "./tenant.service";
import { PaginationParams } from "../../types/pagination.type";

const tenantService = new TenantService();

export class TenantController {
    
    // 1. Method Dashboard (Updated dengan Pagination)
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // Nanti jika Auth sudah digabung, ganti dengan req.user.id
            const tenantUserId = "cmir6p5mw0000bp7b6b0f85da"; 
            const params: PaginationParams = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sortBy: (req.query.sortBy as string) || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
                status: req.query.status as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            const result = await tenantService.getTenantBookings(tenantUserId, params);
            
            res.status(200).json({
                message: "Dashboard data fetched",
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            // ⚠️ PENTING: ID Tenant hardcode sementara (harus sama dengan database)
            const tenantUserId = "cmir6p5mw0000bp7b6b0f85da";
            
            const { bookingId } = req.params;
            const body = req.body; 

            const data = await tenantService.verifyPayment(bookingId, tenantUserId, body);
            
            res.status(200).json({ message: "Booking status updated", data });
        } catch (error) {
            next(error);
        }
    }
}

export default new TenantController();
