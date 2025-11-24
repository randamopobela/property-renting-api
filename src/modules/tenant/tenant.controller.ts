import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../helpers/response.handler"; // Pastikan path ini benar
import { TenantService } from "./tenant.service"; // Import Class-nya

const tenantService = new TenantService();

export class TenantController {
    
    // 1. Method Dashboard (Menggantikan getTenantBookings)
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // TODO: Nanti ganti string ini dengan req.user.id setelah Auth jadi
            const tenantUserId = "user-tenant-1"; // ID Tenant Dummy (Ambil dari Prisma Studio)

            // Panggil service dengan ID, BUKAN req
            const data = await tenantService.getTenantBookings(tenantUserId);
            
            responseHandler(res, "Dashboard data successfully fetched", data);
        } catch (error) {
            next(error);
        }
    }

    // 2. Method Verify Payment
    async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            // TODO: Ganti hardcode user id
            const tenantUserId = "user-tenant-1"; 
            const { bookingId } = req.params;
            const body = req.body; // { action: "APPROVE" | "REJECT" }

            // Panggil service dengan parameter spesifik
            const data = await tenantService.verifyPayment(bookingId, tenantUserId, body);
            
            responseHandler(res, "Booking status successfully updated", data);
        } catch (error) {
            next(error);
        }
    }
}

export default new TenantController();
