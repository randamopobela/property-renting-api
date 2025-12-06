import { Router } from 'express';
import { ReviewController } from './review.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

router.post('/', verifyToken, reviewController.create.bind(reviewController));
router.get('/property/:propertyId', reviewController.getByProperty.bind(reviewController));
router.post('/:reviewId/reply', verifyToken, reviewController.reply.bind(reviewController));

export default router;