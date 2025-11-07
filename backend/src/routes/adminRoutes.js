import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { getPool } from '../utils/db.js';

const router = Router();

router.use(authRequired, requireRole('admin'));

async function logAdminAction(pool, adminId, action, targetType, targetId, details = null) {
  await pool.query(
    'INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
    [adminId, action, targetType, targetId, details ? JSON.stringify(details) : null]
  );
}

router.get('/users', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, role, balance FROM users ORDER BY id DESC');
  res.json(rows);
});

router.get('/stats', async (req, res) => {
  const pool = await getPool();
  try {
    const [[userStats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'user' AND balance > 0) AS users_with_balance
    `);

    const [[auctionStats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM auctions) AS total_auctions,
        (SELECT COUNT(*) FROM auctions WHERE end_time > NOW()) AS active_auctions,
        (SELECT COUNT(*) FROM auctions WHERE end_time <= NOW()) AS finished_auctions
    `);

    const [[paymentStats]] = await pool.query(`
      SELECT 
        IFNULL(SUM(CASE WHEN status IN ('paid','shipped','delivered','completed') THEN amount ELSE 0 END), 0) AS total_volume,
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_transactions
      FROM payment_transactions
    `);

    const [[topUpStats]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_requests,
        IFNULL(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS approved_amount
      FROM top_up_requests
    `);

    const [recentTopUps] = await pool.query(`
      SELECT tur.id, tur.amount, tur.status, tur.created_at,
             u.username AS user_username,
             p.username AS processed_by_username
      FROM top_up_requests tur
      JOIN users u ON tur.user_id = u.id
      LEFT JOIN users p ON tur.processed_by = p.id
      ORDER BY tur.created_at DESC
      LIMIT 5
    `);

    const [recentTransactions] = await pool.query(`
      SELECT pt.id, pt.amount, pt.status, pt.created_at,
             a.title AS auction_title,
             u.username AS winner_username
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      JOIN users u ON pt.winner_id = u.id
      ORDER BY pt.created_at DESC
      LIMIT 5
    `);

    res.json({
      users: userStats,
      auctions: auctionStats,
      payments: paymentStats,
      topUps: { ...topUpStats, recent: recentTopUps },
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

router.get('/auctions', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT a.*, 
           seller.username AS seller_username,
           winner.username AS winner_username,
           winner_bid.amount AS winning_bid_amount,
           winner_bid.created_at AS winning_bid_time,
           CASE 
             WHEN a.end_time > NOW() THEN 'กำลังประมูล'
             ELSE 'สิ้นสุดแล้ว'
           END AS status
    FROM auctions a
    LEFT JOIN users seller ON a.user_id = seller.id
    LEFT JOIN (
      SELECT b1.*
      FROM bids b1
      INNER JOIN (
        SELECT auction_id, MAX(amount) AS max_amount
        FROM bids
        GROUP BY auction_id
      ) b2 ON b1.auction_id = b2.auction_id AND b1.amount = b2.max_amount
    ) winner_bid ON a.id = winner_bid.auction_id
    LEFT JOIN users winner ON winner_bid.user_id = winner.id
    ORDER BY a.id DESC
  `);
  res.json(rows);
});

router.patch('/auctions/:id', async (req, res) => {
  const pool = await getPool();
  const { title, description, end_time: endTime, buy_now_price: buyNowPrice, minimum_increment: minIncrement, bid_type: bidType } = req.body;

  if ([title, description, endTime, buyNowPrice, minIncrement, bidType].every((value) => value === undefined)) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(new Date(endTime));
  }
  if (buyNowPrice !== undefined) {
    fields.push('buy_now_price = ?');
    values.push(buyNowPrice === null ? null : Number(buyNowPrice));
  }
  if (minIncrement !== undefined) {
    fields.push('minimum_increment = ?');
    values.push(minIncrement === null ? null : Number(minIncrement));
  }
  if (bidType !== undefined) {
    fields.push('bid_type = ?');
    values.push(bidType);
  }

  values.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE auctions SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const [updatedRows] = await pool.query('SELECT * FROM auctions WHERE id = ?', [req.params.id]);
    await logAdminAction(pool, req.user.id, 'update_auction', 'auction', Number(req.params.id), { fields: req.body });

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({ message: 'Failed to update auction' });
  }
});

router.post('/auctions/:id/cancel', async (req, res) => {
  const pool = await getPool();
  const { reason } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM auctions WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    await pool.query('UPDATE auctions SET end_time = NOW() WHERE id = ?', [req.params.id]);
    await logAdminAction(pool, req.user.id, 'cancel_auction', 'auction', Number(req.params.id), { reason: reason || null });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error cancelling auction:', error);
    res.status(500).json({ message: 'Failed to cancel auction' });
  }
});

router.get('/top-ups', async (req, res) => {
  const pool = await getPool();
  const { status } = req.query;
  try {
    const params = [];
    let whereClause = '';
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause = 'WHERE tur.status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(`
      SELECT tur.*, u.username AS user_username, p.username AS processed_by_username
      FROM top_up_requests tur
      JOIN users u ON tur.user_id = u.id
      LEFT JOIN users p ON tur.processed_by = p.id
      ${whereClause}
      ORDER BY tur.created_at DESC
    `, params);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching top up requests:', error);
    res.status(500).json({ message: 'Failed to fetch top up requests' });
  }
});

router.post('/top-ups/:id/approve', async (req, res) => {
  const pool = await getPool();
  const conn = await pool.getConnection();
  const { note } = req.body;

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM top_up_requests WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Top up request not found' });
    }

    const request = rows[0];
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Top up request already processed' });
    }

    await conn.query(
      'UPDATE top_up_requests SET status = ?, processed_by = ?, processed_at = NOW(), note = ? WHERE id = ?',
      ['approved', req.user.id, note || request.note, req.params.id]
    );

    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [request.amount, request.user_id]);

    await logAdminAction(conn, req.user.id, 'approve_top_up', 'top_up', Number(req.params.id), {
      amount: Number(request.amount),
      note: note || null
    });

    await conn.commit();

    res.json({ ok: true });
  } catch (error) {
    await conn.rollback();
    console.error('Error approving top up:', error);
    res.status(500).json({ message: 'Failed to approve top up' });
  } finally {
    conn.release();
  }
});

router.post('/top-ups/:id/reject', async (req, res) => {
  const pool = await getPool();
  const conn = await pool.getConnection();
  const { note } = req.body;

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM top_up_requests WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Top up request not found' });
    }

    const request = rows[0];
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Top up request already processed' });
    }

    await conn.query(
      'UPDATE top_up_requests SET status = ?, processed_by = ?, processed_at = NOW(), note = ? WHERE id = ?',
      ['rejected', req.user.id, note || request.note, req.params.id]
    );

    await logAdminAction(conn, req.user.id, 'reject_top_up', 'top_up', Number(req.params.id), {
      amount: Number(request.amount),
      note: note || null
    });

    await conn.commit();

    res.json({ ok: true });
  } catch (error) {
    await conn.rollback();
    console.error('Error rejecting top up:', error);
    res.status(500).json({ message: 'Failed to reject top up' });
  } finally {
    conn.release();
  }
});

router.patch('/users/:id', async (req, res) => {
  const pool = await getPool();
  const { role, balance } = req.body;

  if (role === undefined && balance === undefined) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  const fields = [];
  const values = [];

  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    fields.push('role = ?');
    values.push(role);
  }

  if (balance !== undefined) {
    if (Number.isNaN(Number(balance))) {
      return res.status(400).json({ message: 'Invalid balance value' });
    }
    fields.push('balance = ?');
    values.push(Number(balance));
  }

  values.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [updated] = await pool.query('SELECT id, username, role, balance FROM users WHERE id = ?', [req.params.id]);
    await logAdminAction(pool, req.user.id, 'update_user', 'user', Number(req.params.id), { role, balance });

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const pool = await getPool();
  await pool.query('DELETE FROM bids WHERE user_id=?', [req.params.id]);
  await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
  await logAdminAction(pool, req.user.id, 'delete_user', 'user', Number(req.params.id));
  res.json({ ok: true });
});

router.delete('/auctions/:id', async (req, res) => {
  const pool = await getPool();
  await pool.query('DELETE FROM bids WHERE auction_id=?', [req.params.id]);
  await pool.query('DELETE FROM auctions WHERE id=?', [req.params.id]);
  await logAdminAction(pool, req.user.id, 'delete_auction', 'auction', Number(req.params.id));
  res.json({ ok: true });
});

// Legacy manual balance adjusters (kept for admin emergency use)
router.post('/users/:id/add-funds', async (req, res) => {
  try {
    const pool = await getPool();
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const [currentUser] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    if (!currentUser.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, req.params.id]);
    await logAdminAction(pool, req.user.id, 'manual_add_funds', 'user', Number(req.params.id), { amount: Number(amount), note: note || null });

    const [rows] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);

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

router.post('/users/:id/deduct-funds', async (req, res) => {
  try {
    const pool = await getPool();
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const [userRows] = await pool.query('SELECT id, username, balance FROM users WHERE id = ?', [req.params.id]);
    if (!userRows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    await pool.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, req.params.id]);
    await logAdminAction(pool, req.user.id, 'manual_deduct_funds', 'user', Number(req.params.id), { amount: Number(amount), note: note || null });

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


