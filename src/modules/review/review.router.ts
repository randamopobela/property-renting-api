import { Router } from 'express';
import { ReviewController } from './review.controller';

const router = Router();
const reviewController = new ReviewController();

router.post('/', reviewController.create.bind(reviewController));
router.get('/property/:propertyId', reviewController.getByProperty.bind(reviewController));
router.post('/:reviewId/reply', reviewController.reply.bind(reviewController));

export default router;