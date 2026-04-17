import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as paymentController from '../controllers/paymentController.js';

/**
 * paymentRoutes
 * - ถูก mount ที่: `/api/payments`
 * - logic อยู่ที่ `controllers/paymentController.js`
 */
const router = Router();

router.get('/transactions', authRequired, paymentController.getTransactions);
router.get('/transactions/:id', authRequired, paymentController.getTransactionById);
router.post('/transactions', authRequired, paymentController.createTransaction);
router.post('/transactions/:id/pay', authRequired, paymentController.payTransaction);
router.post('/transactions/:id/ship', authRequired, paymentController.shipTransaction);
router.post('/transactions/:id/deliver', authRequired, paymentController.deliverTransaction);
router.post('/transactions/:id/complete', authRequired, paymentController.completeTransaction);
router.get('/notifications', authRequired, paymentController.listPaymentNotifications);
router.put('/notifications/:id/read', authRequired, paymentController.markPaymentNotificationRead);
router.get('/balance', authRequired, paymentController.getBalance);
router.post('/transactions/:id/tracking', authRequired, paymentController.updateTracking);

export default router;
