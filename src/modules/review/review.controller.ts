import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { CreateReviewRequest, ReplyReviewRequest } from '../../types/review.type';

const reviewService = new ReviewService();

export class ReviewController {

  // POST /api/reviews (User Create Review)
  async create(req: Request, res: Response) {
    try {
        // 👇 TODO: Ganti dengan req.user.id (dari token) nanti saat Auth siap
        const userId = "cmir6p5q10003bp7b6mdz43i2"; 
        
        const data: CreateReviewRequest = req.body;
        
        const result = await reviewService.createReview(userId, data);
        res.status(201).json({ message: "Review created successfully", data: result });
    } catch (error: any) {
        // Handle error unique constraint (P2002) jika user mencoba review booking yang sama 2x
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "You have already reviewed this booking." });
        }
        res.status(400).json({ message: error.message });
    }
  }

  // GET /api/reviews/property/:propertyId (Public List)
  async getByProperty(req: Request, res: Response) {
    try {
        const { propertyId } = req.params;
        const reviews = await reviewService.getPropertyReviews(propertyId);
        res.status(200).json({ message: "Success", data: reviews });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }

  // POST /api/reviews/:reviewId/reply (Tenant Reply)
  async reply(req: Request, res: Response) {
    try {
        // 👇 TODO: Ganti dengan req.user.id (dari token) nanti
        const tenantUserId = "cmir6p5mw0000bp7b6b0f85da"; 
        
        const { reviewId } = req.params;
        const data: ReplyReviewRequest = req.body;

        const result = await reviewService.replyReview(tenantUserId, reviewId, data.reply);
        res.status(200).json({ message: "Reply added successfully", data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
  }
}