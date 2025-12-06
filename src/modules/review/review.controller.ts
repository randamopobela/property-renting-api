import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { CreateReviewRequest, ReplyReviewRequest } from '../../types/review.type';

const reviewService = new ReviewService();

// Helper Function untuk mengambil ID dari Token (untuk menghindari pengulangan)
const getUserIdFromToken = (req: Request): string => {
    const userData = (req as any).user;
    if (!userData) {
        // Log ini akan muncul jika middleware verifyToken LUPA dipasang
        throw new Error("Unauthorized: User data missing from token. Check Review route middleware.");
    }
    // Coba ambil dari field yang paling umum
    const userId = userData.id || userData.userId || userData.user_id;
    if (!userId) {
        throw new Error("Unauthorized: User ID not found in token payload.");
    }
    return userId;
};

export class ReviewController {

    // POST /api/reviews (User Create Review)
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            // 👇 FIX: Ambil userId dari Token (dinamis)
            const userId = getUserIdFromToken(req); 
            
            const data: CreateReviewRequest = req.body;
            
            const result = await reviewService.createReview(userId, data);
            res.status(201).json({ message: "Review created successfully", data: result });
        } catch (error: any) {
            // Handle error unique constraint (P2002) jika user mencoba review booking yang sama 2x
            if (error.code === 'P2002') {
                return res.status(400).json({ message: "You have already reviewed this booking." });
            }
            next(error); // Lempar error lain ke error handler global
        }
    }

    // GET /api/reviews/property/:propertyId (Public List)
    async getByProperty(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.params;
            const reviews = await reviewService.getPropertyReviews(propertyId);
            res.status(200).json({ message: "Success", data: reviews });
        } catch (error: any) {
            next(error);
        }
    }

    // POST /api/reviews/:reviewId/reply (Tenant Reply)
    async reply(req: Request, res: Response, next: NextFunction) {
        try {
            // 👇 FIX: Ambil tenantUserId dari Token (dinamis)
            const tenantUserId = getUserIdFromToken(req); 
            
            const { reviewId } = req.params;
            const data: ReplyReviewRequest = req.body;

            // Pastikan parameter di service disesuaikan: reviewId, reply, tenantUserId
            const result = await reviewService.replyReview(reviewId, data.reply, tenantUserId);
            
            res.status(200).json({ message: "Reply added successfully", data: result });
        } catch (error: any) {
            next(error); // Lempar error ke error handler global
        }
    }
}