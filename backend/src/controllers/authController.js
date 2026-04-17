import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../utils/db.js';

/**
 * authController
 * - ใช้กับหน้า: ลงทะเบียน / เข้าสู่ระบบ / ตรวจ token (ฝั่ง frontend เรียกผ่าน `api.js`)
 * - mount จริงที่: `/api/auth` (ดู `backend/src/server.js` + `routes/authRoutes.js`)
 * - หน้าที่: สร้าง user, login ออก JWT, verify/me ดึงข้อมูลจาก token
 */
// POST /api/auth/register — สมัครสมาชิก (ตรวจ username/email/phone ซ้ำ + hash รหัสผ่าน)
export async function register(req, res) {
  const { username, password, phone, email, role } = req.body;
  if (!username || !password || !phone || !email) {
    return res.status(400).json({ message: 'username, password, phone, and email are required' });
  }

  const pool = await getPool();

  const [usernameRows] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (usernameRows.length) return res.status(409).json({ message: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });

  const [emailRows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (emailRows.length) return res.status(409).json({ message: 'มีอีเมลนี้อยู่แล้ว' });

  const [phoneRows] = await pool.query('SELECT id FROM users WHERE phone=?', [phone]);
  if (phoneRows.length) return res.status(409).json({ message: 'มีเบอร์โทรนี้อยู่แล้ว' });

  const hash = await bcrypt.hash(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'user';
  const [result] = await pool.query(
    'INSERT INTO users (username, password, phone, email, role) VALUES (?, ?, ?, ?, ?)',
    [username, hash, phone, email, userRole]
  );
  res.json({ id: result.insertId, username, phone, email, role: userRole });
}

// POST /api/auth/login — เข้าสู่ระบบ (คืน JWT + role สำหรับเก็บใน client)
export async function login(req, res) {
  const { username, password } = req.body;
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
  if (!rows.length) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}

// GET /api/auth/verify — เช็คว่า token ยังใช้ได้ (ใช้หลัง refresh / โหลดแอป)
export async function verify(req, res) {
  res.json({ valid: true, user: req.user });
}

// GET /api/auth/me — โปรไฟล์เบื้องต้นจาก token (ไม่รวม balance; ฝั่ง users/me มี balance)
export async function me(req, res) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, phone, email, role FROM users WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
}
