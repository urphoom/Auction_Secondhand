import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getPool } from '../utils/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/me', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, phone, email, role, balance FROM users WHERE id=?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

router.post('/me/change-password', authRequired, async (req, res) => {
  const pool = await getPool();
  const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, rows[0].password);
    if (!ok) return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;


