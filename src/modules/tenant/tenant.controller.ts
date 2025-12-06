import { NextFunction, Request, Response } from "express";
import { TenantService } from "./tenant.service";
import { PaginationParams } from "../../types/pagination.type";

const tenantService = new TenantService();

export class TenantController {
    
    // 1. Method Dashboard (Updated dengan Pagination)
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Ambil ID dari Token (Auth Middleware)
            // Pastikan Auth Middleware sudah terpasang di route tenant!
            const user = (req as any).user;
            
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: No token detected" });
            }

            // Ambil ID User yang sedang login
            const tenantUserId = user.id || user.userId || user.user_id;

            // 👇 LOGGING KRUSIAL: Cek di terminal siapa yang login
            console.log("==========================================");
            console.log("🕵️‍♂️ TENANT DASHBOARD DEBUG");
            console.log("👤 Logged In User ID:", tenantUserId);
            console.log("==========================================");

            // Ambil query params dari URL (Pagination)
            const params = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sortBy: (req.query.sortBy as string) || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
                status: req.query.status as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            // Panggil Service dengan ID dinamis
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
            const user = (req as any).user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const tenantUserId = user.id || user.userId || user.user_id;
            
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
