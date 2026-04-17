import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

/**
 * reviewRoutes
 * - ถูก mount ที่: `/api/reviews`
 * - logic อยู่ที่ `controllers/reviewController.js`
 */
const router = Router();

router.post('/', authRequired, reviewController.create);
router.get('/order/:orderId', authRequired, reviewController.getByOrder);
router.get('/seller/:sellerId', reviewController.listBySeller);
router.get('/seller/:sellerId/page', reviewController.sellerPage);

export default router;
