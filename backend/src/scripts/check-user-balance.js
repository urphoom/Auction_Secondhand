import { getPool } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUserBalance() {
  const pool = await getPool();
  
  try {
    const username = 'User_bidder001';
    
    console.log(`🔍 Checking balance for user: ${username}\n`);
    
    // 1. Get user info
    const [users] = await pool.query(`
      SELECT id, username, balance, role
      FROM users
      WHERE username = ?
    `, [username]);
    
    if (users.length === 0) {
      console.log(`❌ User "${username}" not found!`);
      return;
    }
    
    const user = users[0];
    console.log(`📊 User Information:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Current Balance: $${Number(user.balance).toFixed(2)}`);
    console.log(`   Role: ${user.role}\n`);
    
    // 2. Get all bids for this user
    console.log(`💳 Bids History:`);
    const [bids] = await pool.query(`
      SELECT b.*, a.title as auction_title, a.end_time, a.bid_type,
             (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) as max_bid,
             (SELECT user_id FROM bids WHERE auction_id = a.id AND amount = (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) LIMIT 1) as winner_id
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 20
    `, [user.id]);
    
    let totalBidAmount = 0;
    let totalRefunded = 0;
    
    for (const bid of bids) {
      const isWinner = bid.winner_id === user.id;
      const auctionEnded = new Date(bid.end_time) <= new Date();
      const shouldRefund = !isWinner && auctionEnded && bid.bid_type === 'sealed';
      
      console.log(`   - Auction: "${bid.auction_title}"`);
      console.log(`     Bid Amount: $${Number(bid.amount).toFixed(2)}`);
      console.log(`     Bid Type: ${bid.bid_type}`);
      console.log(`     Created: ${new Date(bid.created_at).toLocaleString()}`);
      console.log(`     Auction Ended: ${auctionEnded ? 'Yes' : 'No'}`);
      console.log(`     Winner: ${isWinner ? 'YOU' : 'Someone else'}`);
      console.log(`     Should Refund: ${shouldRefund ? 'Yes (sealed, lost)' : 'No'}`);
      console.log('');
      
      totalBidAmount += Number(bid.amount);
      if (shouldRefund) {
        totalRefunded += Number(bid.amount);
      }
    }
    
    console.log(`📈 Summary:`);
    console.log(`   Total Bid Amount: $${totalBidAmount.toFixed(2)}`);
    console.log(`   Expected Refunds (sealed, lost): $${totalRefunded.toFixed(2)}`);
    
    // 3. Check for notifications about refunds
    console.log(`\n🔔 Refund Notifications:`);
    const [refundNotifications] = await pool.query(`
      SELECT n.*, a.title as auction_title
      FROM notifications n
      JOIN auctions a ON n.auction_id = a.id
      WHERE n.user_id = ? AND n.type = 'bid_refunded'
      ORDER BY n.created_at DESC
    `, [user.id]);
    
    if (refundNotifications.length === 0) {
      console.log(`   No refund notifications found`);
    } else {
      let totalRefundedFromNotifications = 0;
      for (const notif of refundNotifications) {
        // Extract amount from message
        const match = notif.message.match(/\$([\d,]+\.?\d*)/);
        if (match) {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          totalRefundedFromNotifications += amount;
          console.log(`   - ${notif.message}`);
          console.log(`     Created: ${new Date(notif.created_at).toLocaleString()}`);
        }
      }
      console.log(`\n   Total Refunded (from notifications): $${totalRefundedFromNotifications.toFixed(2)}`);
    }
    
    // 4. Calculate expected balance
    console.log(`\n💰 Balance Calculation:`);
    console.log(`   Starting Balance: $8,125,000.00 (assumed)`);
    console.log(`   Total Bids: $${totalBidAmount.toFixed(2)}`);
    console.log(`   Expected Refunds: $${totalRefunded.toFixed(2)}`);
    const expectedBalance = 8125000 - totalBidAmount + totalRefunded;
    console.log(`   Expected Balance: $${expectedBalance.toFixed(2)}`);
    console.log(`   Actual Balance: $${Number(user.balance).toFixed(2)}`);
    console.log(`   Difference: $${(Number(user.balance) - expectedBalance).toFixed(2)}`);
    
    // 5. Check for duplicate processing
    console.log(`\n⚠️  Checking for duplicate processing:`);
    const [endedAuctions] = await pool.query(`
      SELECT a.id, a.title, a.end_time, 
             COUNT(DISTINCT n.id) as notification_count,
             COUNT(DISTINCT pt.id) as payment_transaction_count
      FROM auctions a
      LEFT JOIN bids b ON a.id = b.auction_id AND b.user_id = ?
      LEFT JOIN notifications n ON a.id = n.auction_id AND (n.type = 'auction_won' OR n.type = 'auction_ended')
      LEFT JOIN payment_transactions pt ON a.id = pt.auction_id
      WHERE b.id IS NOT NULL
      AND a.end_time <= NOW()
      GROUP BY a.id
      HAVING notification_count > 2 OR payment_transaction_count > 1
    `, [user.id]);
    
    if (endedAuctions.length > 0) {
      console.log(`   Found ${endedAuctions.length} auctions with potential duplicate processing:`);
      for (const auction of endedAuctions) {
        console.log(`   - "${auction.title}" (ID: ${auction.id})`);
        console.log(`     Notifications: ${auction.notification_count}`);
        console.log(`     Payment Transactions: ${auction.payment_transaction_count}`);
      }
    } else {
      console.log(`   No obvious duplicate processing detected`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the check
checkUserBalance()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });



