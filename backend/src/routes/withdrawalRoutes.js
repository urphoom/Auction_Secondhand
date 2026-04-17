import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as withdrawalController from '../controllers/withdrawalController.js';

/**
 * withdrawalRoutes
 * - ถูก mount ที่: `/api/withdrawals`
 * - logic อยู่ที่ `controllers/withdrawalController.js`
 */
const router = Router();

router.get('/me', authRequired, withdrawalController.listMine);
router.post('/', authRequired, withdrawalController.create);

export default router;
