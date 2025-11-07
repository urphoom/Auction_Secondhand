import { getPool } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserBalance() {
  const pool = await getPool();
  const conn = await pool.getConnection();
  
  try {
    const username = 'User_bidder001';
    
    console.log(`🔍 Fixing balance for user: ${username}\n`);
    
    await conn.beginTransaction();
    
    // 1. Get user info
    const [users] = await conn.query(`
      SELECT id, username, balance, role
      FROM users
      WHERE username = ?
      FOR UPDATE
    `, [username]);
    
    if (users.length === 0) {
      console.log(`❌ User "${username}" not found!`);
      await conn.rollback();
      return;
    }
    
    const user = users[0];
    const currentBalance = Number(user.balance);
    console.log(`📊 Current Balance: $${currentBalance.toFixed(2)}\n`);
    
    // 2. Calculate expected balance
    // Starting balance: 8,125,000
    // Bid: 250,000 (should be deducted)
    // Expected after bid: 7,875,000
    // If lost (sealed): +250,000 refund = 8,125,000
    // If lost (increment): no refund = 7,875,000
    
    console.log(`💰 Calculating expected balance...`);
    
    // Get all bids and check refund status
    const [bids] = await conn.query(`
      SELECT b.*, a.title as auction_title, a.end_time, a.bid_type,
             (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) as max_bid,
             (SELECT user_id FROM bids WHERE auction_id = a.id AND amount = (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) LIMIT 1) as winner_id,
             (SELECT COUNT(*) FROM notifications WHERE user_id = b.user_id AND auction_id = a.id AND type = 'bid_refunded') as refund_count
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [user.id]);
    
    let totalBids = 0;
    let totalRefunds = 0;
    let expectedBalance = 8125000; // Starting balance
    
    console.log(`   Starting Balance: $${expectedBalance.toFixed(2)}\n`);
    
    for (const bid of bids) {
      const bidAmount = Number(bid.amount);
      const isWinner = bid.winner_id === user.id;
      const auctionEnded = new Date(bid.end_time) <= new Date();
      const shouldRefund = !isWinner && auctionEnded && bid.bid_type === 'sealed';
      
      totalBids += bidAmount;
      expectedBalance -= bidAmount;
      
      if (shouldRefund) {
        // Check if refund was actually processed
        if (bid.refund_count > 0) {
          totalRefunds += bidAmount;
          expectedBalance += bidAmount;
          console.log(`   - Bid $${bidAmount.toFixed(2)} on "${bid.auction_title}" (${bid.bid_type}): Lost, refunded`);
        } else {
          console.log(`   - Bid $${bidAmount.toFixed(2)} on "${bid.auction_title}" (${bid.bid_type}): Lost, should refund but not processed`);
        }
      } else if (isWinner) {
        console.log(`   - Bid $${bidAmount.toFixed(2)} on "${bid.auction_title}" (${bid.bid_type}): WON (no refund)`);
      } else if (!auctionEnded) {
        console.log(`   - Bid $${bidAmount.toFixed(2)} on "${bid.auction_title}" (${bid.bid_type}): Auction not ended yet`);
      } else if (bid.bid_type === 'increment') {
        console.log(`   - Bid $${bidAmount.toFixed(2)} on "${bid.auction_title}" (${bid.bid_type}): Lost, no refund (increment type)`);
      }
    }
    
    console.log(`\n   Total Bids: $${totalBids.toFixed(2)}`);
    console.log(`   Total Refunds: $${totalRefunds.toFixed(2)}`);
    console.log(`   Expected Balance: $${expectedBalance.toFixed(2)}`);
    console.log(`   Current Balance: $${currentBalance.toFixed(2)}`);
    console.log(`   Difference: $${(currentBalance - expectedBalance).toFixed(2)}\n`);
    
    // 3. Fix balance if different
    if (Math.abs(currentBalance - expectedBalance) > 0.01) {
      console.log(`⚠️  Balance mismatch detected!`);
      console.log(`   Fixing balance from $${currentBalance.toFixed(2)} to $${expectedBalance.toFixed(2)}...\n`);
      
      await conn.query(`
        UPDATE users 
        SET balance = ? 
        WHERE id = ?
      `, [expectedBalance, user.id]);
      
      await conn.commit();
      
      console.log(`✅ Balance fixed successfully!\n`);
      console.log(`   New Balance: $${expectedBalance.toFixed(2)}`);
    } else {
      await conn.rollback();
      console.log(`✅ Balance is correct, no changes needed.\n`);
    }
    
    // 4. Check for duplicate refund notifications
    console.log(`🔍 Checking for duplicate refunds...`);
    const [duplicateRefunds] = await conn.query(`
      SELECT auction_id, COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND type = 'bid_refunded'
      GROUP BY auction_id
      HAVING COUNT(*) > 1
    `, [user.id]);
    
    if (duplicateRefunds.length > 0) {
      console.log(`   ⚠️  Found ${duplicateRefunds.length} auctions with duplicate refund notifications:`);
      for (const dup of duplicateRefunds) {
        console.log(`   - Auction ID ${dup.auction_id}: ${dup.count} refund notifications`);
      }
    } else {
      console.log(`   ✅ No duplicate refund notifications found`);
    }
    
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error:', error);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

// Run the fix
fixUserBalance()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });



