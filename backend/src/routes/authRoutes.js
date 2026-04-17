import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

/**
 * authRoutes
 * - ถูก mount ที่: `/api/auth` (ดู `backend/src/server.js`)
 * - logic อยู่ที่ `controllers/authController.js`
 */
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authRequired, authController.verify);
router.get('/me', authRequired, authController.me);

export default router;
