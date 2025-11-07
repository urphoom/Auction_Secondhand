import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

const router = Router();

// Active auctions
router.get('/active', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, title, current_price, end_time, image FROM auctions WHERE end_time > NOW() ORDER BY end_time ASC'
  );
  res.json(rows);
});

// Highest bid for auction
router.get('/:id/highest-bid', async (req, res) => {
  const pool = await getPool();
  
  // First check the auction type
  const [auctionRows] = await pool.query('SELECT bid_type, end_time FROM auctions WHERE id=?', [req.params.id]);
  if (!auctionRows.length) return res.status(404).json({ message: 'Auction not found' });
  
  const auction = auctionRows[0];
  const isAuctionEnded = new Date() >= new Date(auction.end_time);
  
  // For sealed bids, only show highest bid if auction has ended
  if (auction.bid_type === 'sealed' && !isAuctionEnded) {
    return res.json({ amount: null, username: null, sealed: true });
  }
  
  const [rows] = await pool.query(
    `SELECT b.amount AS amount, u.username AS username
     FROM bids b
     JOIN users u ON b.user_id = u.id
     WHERE b.auction_id = ?
     ORDER BY b.amount DESC, b.created_at ASC
     LIMIT 1`,
    [req.params.id]
  );
  if (!rows.length) return res.json({ amount: null, username: null });
  res.json(rows[0]);
});

// Top 5 bidders for auction
router.get('/:id/top-bidders', async (req, res) => {
  const pool = await getPool();
  
  // First check the auction type
  const [auctionRows] = await pool.query('SELECT bid_type, end_time FROM auctions WHERE id=?', [req.params.id]);
  if (!auctionRows.length) return res.status(404).json({ message: 'Auction not found' });
  
  const auction = auctionRows[0];
  const isAuctionEnded = new Date() >= new Date(auction.end_time);
  
  // For sealed bids, only show bidders if auction has ended
  if (auction.bid_type === 'sealed' && !isAuctionEnded) {
    return res.json([]);
  }
  
  const [rows] = await pool.query(
    `SELECT u.username, MAX(b.amount) AS top_amount
     FROM bids b
     JOIN users u ON u.id = b.user_id
     WHERE b.auction_id = ?
     GROUP BY b.user_id, u.username
     ORDER BY top_amount DESC
     LIMIT 5`,
    [req.params.id]
  );
  res.json(rows);
});

// List auctions
router.get('/', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM auctions ORDER BY end_time DESC');
  res.json(rows);
});

// Get user's own auctions with winners only
router.get('/my-auctions', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT a.*, 
           COUNT(b.id) as bid_count,
           winner.user_id as winner_id,
           winner.username as winner_username,
           winner.amount as winning_amount
    FROM auctions a
    LEFT JOIN bids b ON a.id = b.auction_id
    LEFT JOIN (
      SELECT b1.*, u.username
      FROM bids b1
      JOIN users u ON b1.user_id = u.id
      INNER JOIN (
        SELECT auction_id, MAX(amount) as max_amount
        FROM bids
        GROUP BY auction_id
      ) b2 ON b1.auction_id = b2.auction_id AND b1.amount = b2.max_amount
    ) winner ON a.id = winner.auction_id
    WHERE a.user_id = ?
    AND a.end_time <= NOW()
    AND winner.user_id IS NOT NULL
    GROUP BY a.id
    ORDER BY a.end_time DESC
  `, [req.user.id]);
  res.json(rows);
});

// Get one
router.get('/:id', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT a.*, u.username AS owner_username FROM auctions a JOIN users u ON a.user_id = u.id WHERE a.id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  const [bids] = await pool.query('SELECT b.*, u.username FROM bids b JOIN users u ON b.user_id=u.id WHERE auction_id=? ORDER BY created_at DESC', [req.params.id]);
  res.json({ ...rows[0], bids });
});

// Create auction
router.post('/', authRequired, upload.single('image'), async (req, res) => {
  try {
    const { title, description, start_price, end_time, bid_type, minimum_increment, buy_now_price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const pool = await getPool();
    
    // Validate required fields
    if (!title || !start_price || !end_time) {
      return res.status(400).json({ message: 'Missing required fields: title, start_price, or end_time' });
    }
    
    // Validate bid type
    const validBidTypes = ['increment', 'sealed'];
    const selectedBidType = validBidTypes.includes(bid_type) ? bid_type : 'increment';
    const minIncrement = selectedBidType === 'increment' ? (Number(minimum_increment) || 1.00) : null;
    
    // Validate buy now price if provided
    let buyNowPrice = null;
    if (buy_now_price !== undefined && buy_now_price !== null && buy_now_price !== '') {
      const buyNowStr = String(buy_now_price).trim();
      if (buyNowStr !== '') {
        buyNowPrice = Number(buyNowStr);
        if (isNaN(buyNowPrice) || buyNowPrice <= 0) {
          return res.status(400).json({ message: 'Buy now price must be greater than 0' });
        }
        if (buyNowPrice <= Number(start_price)) {
          return res.status(400).json({ message: 'Buy now price must be greater than start price' });
        }
      }
    }
    
    const [result] = await pool.query(
      'INSERT INTO auctions (title, description, image, start_price, current_price, end_time, user_id, bid_type, minimum_increment, buy_now_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, image, start_price, start_price, end_time, req.user.id, selectedBidType, minIncrement, buyNowPrice]
    );
    const [rows] = await pool.query('SELECT * FROM auctions WHERE id=?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ message: error.message || 'Failed to create auction' });
  }
});

// Update auction (owner or admin)
router.put('/:id', authRequired, upload.single('image'), async (req, res) => {
  const { title, description, end_time } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM auctions WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  const auction = rows[0];
  if (req.user.role !== 'admin' && auction.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const newImage = image !== undefined ? image : auction.image;
  await pool.query('UPDATE auctions SET title=?, description=?, image=?, end_time=? WHERE id=?', [title ?? auction.title, description ?? auction.description, newImage, end_time ?? auction.end_time, req.params.id]);
  const [updated] = await pool.query('SELECT * FROM auctions WHERE id=?', [req.params.id]);
  res.json(updated[0]);
});

// Delete auction
router.delete('/:id', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM auctions WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  const auction = rows[0];
  if (req.user.role !== 'admin' && auction.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await pool.query('DELETE FROM bids WHERE auction_id=?', [req.params.id]);
  await pool.query('DELETE FROM auctions WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

export default router;

// Place a bid via REST (transactional)
router.post('/:id/bids', authRequired, async (req, res) => {
  const pool = await getPool();
  const conn = await pool.getConnection();
  const auctionId = Number(req.params.id);
  const userId = req.user.id;
  const amount = Number(req.body.amount);
  try {
    if (!amount || isNaN(amount)) return res.status(400).json({ message: 'Invalid amount' });

    // Prevent admin from bidding
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot participate in auctions' });
    }
    
    await conn.beginTransaction();
    const [userRows] = await conn.query('SELECT id, balance FROM users WHERE id=? FOR UPDATE', [userId]);
    if (!userRows.length) throw new Error('User not found');
    const user = userRows[0];
    const [auctionRows] = await conn.query('SELECT * FROM auctions WHERE id=? FOR UPDATE', [auctionId]);
    if (!auctionRows.length) throw new Error('Auction not found');
    const auction = auctionRows[0];
    if (new Date() >= new Date(auction.end_time)) throw new Error('Auction ended');
    if (auction.user_id === userId) throw new Error('You cannot bid on your own auction');
    
    if (auction.bid_type === 'increment') {
      // For increment bids, must be higher than current price
      if (!(amount > Number(auction.current_price))) throw new Error('Bid must be higher than current price');
      if (auction.minimum_increment && amount < Number(auction.current_price) + Number(auction.minimum_increment)) {
        throw new Error(`Bid must be at least ${Number(auction.current_price) + Number(auction.minimum_increment)} (current price + minimum increment)`);
      }
      await conn.query('UPDATE auctions SET current_price=? WHERE id=?', [amount, auctionId]);
    } else if (auction.bid_type === 'sealed') {
      // For sealed bids, just need to be at least the start price
      if (amount < Number(auction.start_price)) throw new Error('Bid must be at least the starting price');
    }
    
    const [existingBid] = await conn.query('SELECT id, amount FROM bids WHERE auction_id=? AND user_id=?', [auctionId, userId]);
    const previousAmount = existingBid.length > 0 ? Number(existingBid[0].amount) : 0;
    const additionalAmount = existingBid.length > 0 ? amount - previousAmount : amount;
    if (additionalAmount <= 0) throw new Error('New bid must be higher than your previous bid');

    if (Number(user.balance) < additionalAmount) throw new Error('Insufficient balance');

    if (existingBid.length > 0) {
      await conn.query('UPDATE bids SET amount = ? WHERE id = ?', [amount, existingBid[0].id]);
      await conn.query('UPDATE users SET balance = balance - ? WHERE id=?', [additionalAmount, userId]);
    } else {
      await conn.query('INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES (?, ?, ?, NOW())', [auctionId, userId, amount]);
      await conn.query('UPDATE users SET balance = balance - ? WHERE id=?', [additionalAmount, userId]);
    }
    await conn.commit();
    res.json({ ok: true, newPrice: auction.bid_type === 'increment' ? amount : auction.current_price });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    conn.release();
  }
});

// Buy Now - Instant purchase at buy_now_price
router.post('/:id/buy-now', authRequired, async (req, res) => {
  const pool = await getPool();
  const conn = await pool.getConnection();
  const auctionId = Number(req.params.id);
  const userId = req.user.id;
  const io = req.app.get('io'); // Get io instance from app
  
  try {
    await conn.beginTransaction();
    
    // Prevent admin from buying
    if (req.user.role === 'admin') {
      await conn.rollback();
      return res.status(403).json({ message: 'Admin cannot participate in auctions' });
    }
    
    // Get user with lock
    const [userRows] = await conn.query('SELECT id, balance, username FROM users WHERE id=? FOR UPDATE', [userId]);
    if (!userRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userRows[0];
    
    // Get auction with lock
    const [auctionRows] = await conn.query('SELECT * FROM auctions WHERE id=? FOR UPDATE', [auctionId]);
    if (!auctionRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Auction not found' });
    }
    const auction = auctionRows[0];
    
    // Check if auction has ended
    if (new Date() >= new Date(auction.end_time)) {
      await conn.rollback();
      return res.status(400).json({ message: 'Auction has already ended' });
    }
    
    // Check if buy now price is set
    if (!auction.buy_now_price || auction.buy_now_price === null) {
      await conn.rollback();
      return res.status(400).json({ message: 'Buy now price is not available for this auction' });
    }
    
    // Check if user is the auction owner
    if (auction.user_id === userId) {
      await conn.rollback();
      return res.status(400).json({ message: 'You cannot buy your own auction' });
    }
    
    // Check if payment transaction already exists (already bought)
    const [existingTransaction] = await conn.query(`
      SELECT id FROM payment_transactions 
      WHERE auction_id = ? 
      FOR UPDATE
    `, [auctionId]);
    
    if (existingTransaction.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'This auction has already been purchased' });
    }
    
    const buyNowPrice = Number(auction.buy_now_price);
    
    // Check if user has sufficient balance
    if (Number(user.balance) < buyNowPrice) {
      await conn.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Update auction: end it immediately and set current price to buy now price
    await conn.query(`
      UPDATE auctions 
      SET end_time = NOW(), current_price = ? 
      WHERE id = ?
    `, [buyNowPrice, auctionId]);
    
    // Deduct balance from buyer
    const [updateResult] = await conn.query(`
      UPDATE users 
      SET balance = balance - ? 
      WHERE id = ?
    `, [buyNowPrice, userId]);
    
    // Verify balance was deducted (use approximate comparison for floating point)
    const [verifyUser] = await conn.query('SELECT balance FROM users WHERE id=?', [userId]);
    const expectedBalance = Number(user.balance) - buyNowPrice;
    const actualBalance = Number(verifyUser[0]?.balance || 0);
    if (verifyUser.length === 0 || Math.abs(actualBalance - expectedBalance) > 0.01) {
      console.error(`Balance deduction verification failed: expected ${expectedBalance}, got ${actualBalance}`);
      await conn.rollback();
      return res.status(500).json({ message: 'Failed to deduct balance' });
    }
    console.log(`✅ Balance deducted: ${Number(user.balance)} -> ${actualBalance} (${buyNowPrice})`);
    
    // Refund all existing bidders (if any)
    const [existingBids] = await conn.query(`
      SELECT DISTINCT user_id, SUM(amount) as total_amount
      FROM bids 
      WHERE auction_id = ? AND user_id != ?
      GROUP BY user_id
    `, [auctionId, userId]);
    
    // Store bidder info for notifications after commit
    const biddersToRefund = [];
    for (const bid of existingBids) {
      await conn.query(`
        UPDATE users 
        SET balance = balance + ? 
        WHERE id = ?
      `, [bid.total_amount, bid.user_id]);
      
      biddersToRefund.push({
        userId: bid.user_id,
        amount: bid.total_amount
      });
    }
    
    // Create payment transaction
    const winner = {
      user_id: userId,
      username: user.username,
      amount: buyNowPrice
    };
    
    const transactionId = await NotificationService.createPaymentTransaction(auction, winner, conn);
    
    // Create chat room for winner and seller (must succeed)
    const chatRoomId = await NotificationService.createWinnerChatRoom(auction, winner, conn);
    console.log(`✅ Chat room created for auction ${auctionId}: room ID ${chatRoomId}`);
    
    await conn.commit();
    console.log(`✅ Chat room ${chatRoomId} committed for auction ${auctionId}`);
    
    // Now create notifications AFTER transaction is committed
    // This ensures notifications are created only if transaction succeeds
    try {
      // Create refund notifications for bidders
      for (const bidder of biddersToRefund) {
        await NotificationService.createNotification({
          userId: bidder.userId,
          auctionId: auction.id,
          type: 'bid_refunded',
          title: 'เงินคืนการประมูล',
          message: `การประมูล "${auction.title}" ถูกปิดด้วยการซื้อทันที เงินจำนวน ฿${Number(bidder.amount).toFixed(2)} ถูกคืนให้คุณแล้ว`
        }, io);
      }
      
      // Create winner notification
      await NotificationService.createNotification({
        userId: userId,
        auctionId: auction.id,
        type: 'auction_won',
        title: 'คุณซื้อสินค้าสำเร็จ!',
        message: `คุณได้ซื้อ "${auction.title}" ในราคา ฿${buyNowPrice.toFixed(2)} เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ`
      }, io);
      
      // Create auction ended notification for seller
      await NotificationService.createNotification({
        userId: auction.user_id,
        auctionId: auction.id,
        type: 'auction_ended',
        title: 'การประมูลของคุณถูกปิดด้วยการซื้อทันที',
        message: `การประมูล "${auction.title}" ถูกปิดด้วยการซื้อทันทีในราคา ฿${buyNowPrice.toFixed(2)}`
      }, io);
      
      console.log(`✅ Notifications created for auction ${auctionId}`);
    } catch (notifError) {
      // Log error but don't fail the request since transaction already succeeded
      console.error('Error creating notifications (non-critical):', notifError);
    }
    
    // Emit socket event to notify all users that auction ended
    if (io) {
      io.to(`auction:${auctionId}`).emit('bidUpdated', { 
        auctionId, 
        amount: buyNowPrice, 
        userId,
        ended: true
      });
      io.to(`auction:${auctionId}`).emit('auctionEnded', { 
        auctionId,
        winnerId: userId,
        winnerUsername: user.username,
        finalPrice: buyNowPrice
      });
    }
    
    console.log(`✅ Buy Now successful: Auction ${auctionId} purchased by user ${userId} for ${buyNowPrice}`);
    
    res.json({ 
      ok: true, 
      message: 'Purchase successful!',
      transactionId: transactionId,
      newBalance: Number(verifyUser[0].balance)
    });
  } catch (e) {
    await conn.rollback();
    console.error('Error in buy-now:', e);
    console.error('Stack trace:', e.stack);
    res.status(400).json({ message: e.message || 'Failed to process buy now' });
  } finally {
    conn.release();
  }
});


