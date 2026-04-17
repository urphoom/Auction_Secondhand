import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

/**
 * userRoutes
 * - ถูก mount ที่: `/api/users`
 * - logic อยู่ที่ `controllers/userController.js`
 */
const router = Router();

router.get('/me', authRequired, userController.me);
router.post('/me/change-password', authRequired, userController.changePassword);

export default router;
