import { Router } from 'express';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

/**
 * notificationRoutes
 * - ถูก mount ที่: `/api/notifications`
 * - หน้าที่รวม: แจ้งเตือนในระบบ (อ่าน/นับ unread/ทำเครื่องหมายอ่านแล้ว/ลบ)
 */
const router = Router();

// GET /api/notifications — ดึงรายการแจ้งเตือนของผู้ใช้ (admin จะได้รับบางประเภทเพิ่ม)
router.get('/', authRequired, async (req, res) => {
  try {
    const adminTypes = ['topup_created', 'withdrawal_created'];
    const notifications = await NotificationService.getUserNotifications(
      req.user.id,
      50,
      req.user.role === 'admin' ? adminTypes : null
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count — นับจำนวนแจ้งเตือนที่ยังไม่อ่าน
router.get('/unread-count', authRequired, async (req, res) => {
  try {
    const adminTypes = ['topup_created', 'withdrawal_created'];
    const count = await NotificationService.getUnreadCount(
      req.user.id,
      req.user.role === 'admin' ? adminTypes : null
    );
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// PUT /api/notifications/:id/read — ทำเครื่องหมายว่าแจ้งเตือน 1 รายการ “อ่านแล้ว”
router.put('/:id/read', authRequired, async (req, res) => {
  try {
    await NotificationService.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/mark-all-read — ทำเครื่องหมายว่าอ่านทั้งหมดของผู้ใช้คนนี้
router.put('/mark-all-read', authRequired, async (req, res) => {
  try {
    await NotificationService.markAllNotificationsAsRead(req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id — ลบแจ้งเตือน (เฉพาะของ user ตัวเอง)
router.delete('/:id', authRequired, async (req, res) => {
  const pool = await getPool();
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [
      req.params.id, 
      req.user.id
    ]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

export default router;

