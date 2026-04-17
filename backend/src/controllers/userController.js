import bcrypt from 'bcryptjs';
import { getPool } from '../utils/db.js';

/**
 * userController
 * - ใช้กับหน้า: โปรไฟล์ / ตั้งค่าบัญชี (เมนูผู้ใช้ → จัดการโปรไฟล์)
 * - mount จริงที่: `/api/users` (`routes/userRoutes.js`)
 */
// GET /api/users/me — ข้อมูลผู้ใช้ที่ล็อกอิน (รวม balance สำหรับแสดงยอดในแอป)
export async function me(req, res) {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, phone, email, role, balance FROM users WHERE id=?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
}

// POST /api/users/me/change-password — เปลี่ยนรหัสผ่าน (ยืนยันรหัสเดิมก่อน)
export async function changePassword(req, res) {
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
}
