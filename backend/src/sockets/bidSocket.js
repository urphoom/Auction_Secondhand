import { getPool } from '../utils/db.js';

export function registerBidSocketHandlers(io, socket) {
  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
  });

  // Handle bid placement
  socket.on('placeBid', async ({ auctionId, userId, amount }) => {
    const pool = await getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      // Check user role first
      const [userRoleRows] = await conn.query('SELECT role FROM users WHERE id=?', [userId]);
      if (!userRoleRows.length) throw new Error('User not found');
      if (userRoleRows[0].role === 'admin') {
        throw new Error('Admin cannot participate in auctions');
      }
      
      // Lock user row to check balance safely during concurrent bids
      const [userRows] = await conn.query('SELECT id, balance FROM users WHERE id=? FOR UPDATE', [userId]);
      if (!userRows.length) throw new Error('User not found');
      const bidder = userRows[0];

      const [rows] = await conn.query('SELECT * FROM auctions WHERE id=? FOR UPDATE', [auctionId]);
      if (!rows.length) throw new Error('Auction not found');
      const auction = rows[0];
      const now = new Date();
      if (now > new Date(auction.end_time)) throw new Error('Auction ended');
      if (Number(amount) <= Number(auction.current_price)) throw new Error('Bid must be higher');
      if (Number(bidder.balance) < Number(amount)) throw new Error('Insufficient balance');

      await conn.query('INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES (?, ?, ?, NOW())', [auctionId, userId, amount]);
      await conn.query('UPDATE auctions SET current_price=? WHERE id=?', [amount, auctionId]);
      // Immediately deduct user's balance (optional business rule; enabled here)
      await conn.query('UPDATE users SET balance = balance - ? WHERE id=?', [amount, userId]);
      await conn.commit();

      const payload = { auctionId, amount: Number(amount), userId };
      io.to(`auction:${auctionId}`).emit('bidUpdated', payload);
    } catch (e) {
      await conn.rollback();
      socket.emit('bidError', { message: e.message });
    } finally {
      conn.release();
    }
  });
}


