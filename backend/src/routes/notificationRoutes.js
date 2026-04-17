import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

/**
 * notificationRoutes
 * - ถูก mount ที่: `/api/notifications`
 * - logic อยู่ที่ `controllers/notificationController.js`
 */
const router = Router();

router.get('/', authRequired, notificationController.list);
router.get('/unread-count', authRequired, notificationController.unreadCount);
router.put('/:id/read', authRequired, notificationController.markRead);
router.put('/mark-all-read', authRequired, notificationController.markAllRead);
router.delete('/:id', authRequired, notificationController.remove);

export default router;
