import { Router } from 'express';
import { PaymentController } from './payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/notification', paymentController.handleNotification.bind(paymentController));

export default router; 