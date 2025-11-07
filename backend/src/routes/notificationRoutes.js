import { Router } from 'express';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

// Get user notifications
router.get('/', authRequired, async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authRequired, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authRequired, async (req, res) => {
  try {
    await NotificationService.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authRequired, async (req, res) => {
  try {
    await NotificationService.markAllNotificationsAsRead(req.user.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
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

