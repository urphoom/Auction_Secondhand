import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password, phone, email, role } = req.body;
  if (!username || !password || !phone || !email) {
    return res.status(400).json({ message: 'username, password, phone, and email are required' });
  }
  
  const pool = await getPool();
  
  // Check if username already exists
  const [usernameRows] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (usernameRows.length) return res.status(409).json({ message: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });
  
  // Check if email already exists
  const [emailRows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (emailRows.length) return res.status(409).json({ message: 'มีอีเมลนี้อยู่แล้ว' });
  
  // Check if phone already exists
  const [phoneRows] = await pool.query('SELECT id FROM users WHERE phone=?', [phone]);
  if (phoneRows.length) return res.status(409).json({ message: 'มีเบอร์โทรนี้อยู่แล้ว' });
  
  const hash = await bcrypt.hash(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'user';
  const [result] = await pool.query('INSERT INTO users (username, password, phone, email, role) VALUES (?, ?, ?, ?, ?)', [username, hash, phone, email, userRole]);
  res.json({ id: result.insertId, username, phone, email, role: userRole });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
  if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Verify token endpoint
router.get('/verify', authRequired, async (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;

// Get current user
router.get('/me', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, phone, email, role FROM users WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});


