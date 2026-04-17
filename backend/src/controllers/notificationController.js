import { getPool } from '../utils/db.js';
import { NotificationService } from '../services/notificationService.js';

/**
 * notificationController
 * - ใช้กับหน้า: แจ้งเตือนในแอป (`/notifications` หรือ dropdown)
 * - mount จริงที่: `/api/notifications`
 * - หมายเหตุ: admin จะได้รับบางประเภทแจ้งเตือนเพิ่ม (เติมเงิน/ถอน) ตาม logic ใน handler
 */
// GET /api/notifications — รายการแจ้งเตือนล่าสุดของผู้ใช้
export async function list(req, res) {
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
}

// GET /api/notifications/unread-count — นับ unread (มุมกระดิ่ง)
export async function unreadCount(req, res) {
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
}

// PUT /api/notifications/:id/read — ทำเครื่องหมายอ่าน 1 รายการ
export async function markRead(req, res) {
  try {
    await NotificationService.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
}

// PUT /api/notifications/mark-all-read — อ่านทั้งหมดของ user นี้
export async function markAllRead(req, res) {
  try {
    await NotificationService.markAllNotificationsAsRead(req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
}

// DELETE /api/notifications/:id — ลบแจ้งเตือน (เฉพาะของตัวเอง)
export async function remove(req, res) {
  const pool = await getPool();
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
}
