import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { getPool } from '../utils/db.js';

const router = Router();

router.use(authRequired, requireRole('admin'));

router.get('/users', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, role, balance FROM users WHERE role = ? ORDER BY id DESC', ['user']);
  res.json(rows);
});

router.get('/auctions', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT a.*, 
           seller.username as seller_username,
           winner.username as winner_username,
           winner_bid.amount as winning_bid_amount,
           winner_bid.created_at as winning_bid_time,
           CASE 
             WHEN a.end_time > NOW() THEN 'กำลังประมูล'
             ELSE 'สิ้นสุดแล้ว'
           END as status
    FROM auctions a
    LEFT JOIN users seller ON a.user_id = seller.id
    LEFT JOIN (
      SELECT b1.*
      FROM bids b1
      INNER JOIN (
        SELECT auction_id, MAX(amount) as max_amount
        FROM bids
        GROUP BY auction_id
      ) b2 ON b1.auction_id = b2.auction_id AND b1.amount = b2.max_amount
    ) winner_bid ON a.id = winner_bid.auction_id
    LEFT JOIN users winner ON winner_bid.user_id = winner.id
    ORDER BY a.id DESC
  `);
  res.json(rows);
});

router.delete('/users/:id', async (req, res) => {
  const pool = await getPool();
  await pool.query('DELETE FROM bids WHERE user_id=?', [req.params.id]);
  await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.delete('/auctions/:id', async (req, res) => {
  const pool = await getPool();
  await pool.query('DELETE FROM bids WHERE auction_id=?', [req.params.id]);
  await pool.query('DELETE FROM auctions WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Add funds to user account
router.post('/users/:id/add-funds', async (req, res) => {
  try {
    console.log('Add funds request:', { userId: req.params.id, body: req.body });
    
    const pool = await getPool();
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Get current balance first
    const [currentUser] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    if (!currentUser.length) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Current balance:', currentUser[0].balance);
    
    await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, req.params.id]);
    console.log('Updated balance with amount:', amount);
    
    // Get updated user data
    const [rows] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    console.log('New balance:', rows[0].balance);
    
    res.json({ 
      success: true, 
      message: `Added ฿${amount} to ${rows[0].username}'s account`,
      user: rows[0]
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
});

// Deduct funds from user account
router.post('/users/:id/deduct-funds', async (req, res) => {
  try {
    const pool = await getPool();
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Check if user has sufficient balance
    const [userRows] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    if (!userRows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userRows[0];
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    await pool.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, req.params.id]);
    
    // Get updated user data
    const [rows] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      message: `Deducted ฿${amount} from ${rows[0].username}'s account`,
      user: rows[0]
    });
  } catch (error) {
    console.error('Error deducting funds:', error);
    res.status(500).json({ message: 'Failed to deduct funds' });
  }
});


export default router;


