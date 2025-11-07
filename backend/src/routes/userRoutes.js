import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getPool } from '../utils/db.js';

const router = Router();

router.get('/me', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, role, balance FROM users WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

export default router;


