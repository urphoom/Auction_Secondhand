import dotenv from 'dotenv';
import { getPool } from './src/utils/db.js';
import { NotificationService } from './src/services/notificationService.js';

dotenv.config();

async function testChatRooms() {
  const pool = await getPool();
  
  try {
    console.log('🔍 Testing chat room creation...\n');
    
    // Get all ended auctions with bids
    const [auctions] = await pool.query(`
      SELECT a.*, 
             (SELECT u.username FROM users u WHERE u.id = a.user_id) as owner_username
      FROM auctions a 
      WHERE a.end_time <= NOW() 
      AND a.id IN (SELECT DISTINCT auction_id FROM bids)
      ORDER BY a.end_time DESC
      LIMIT 10
    `);
    
    console.log(`Found ${auctions.length} ended auctions with bids\n`);
    
    for (const auction of auctions) {
      console.log(`📦 Auction ${auction.id}: "${auction.title}"`);
      console.log(`   Ended at: ${auction.end_time}`);
      console.log(`   Seller: ${auction.owner_username} (ID: ${auction.user_id})`);
      
      // Check if already processed
      const [notifications] = await pool.query(`
        SELECT type FROM notifications WHERE auction_id = ? AND type IN ('auction_won', 'auction_ended')
      `, [auction.id]);
      
      const [payments] = await pool.query(`
        SELECT id FROM payment_transactions WHERE auction_id = ?
      `, [auction.id]);
      
      console.log(`   Notifications: ${notifications.length}, Payments: ${payments.length}`);
      
      // Get winner
      const [bids] = await pool.query(`
        SELECT b.*, u.username, u.id as user_id
        FROM bids b
        JOIN users u ON b.user_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1
      `, [auction.id]);
      
      if (bids.length === 0) {
        console.log('   ⚠️  No bids found\n');
        continue;
      }
      
      const winner = bids[0];
      console.log(`   Winner: ${winner.username} (ID: ${winner.user_id}) - Amount: ${winner.amount}`);
      
      // Check if chat room exists
      const roomName = `🏆 ${auction.title} - Winner Chat`;
      const [existingRooms] = await pool.query(`
        SELECT id, name, created_by, created_at 
        FROM chat_rooms 
        WHERE name = ? AND created_by = ?
      `, [roomName, auction.user_id]);
      
      if (existingRooms.length > 0) {
        console.log(`   ✅ Chat room EXISTS: ID ${existingRooms[0].id}, created at ${existingRooms[0].created_at}\n`);
      } else {
        console.log(`   ❌ Chat room NOT FOUND`);
        console.log(`      Expected: "${roomName}"`);
        console.log(`      Created by: ${auction.user_id}`);
        
        // Try to process manually
        if (notifications.length === 0 && payments.length === 0) {
          console.log(`   🔧 Attempting to process auction manually...`);
          try {
            await NotificationService.processAuctionEnd(auction, null);
            console.log(`   ✅ Processing completed`);
            
            // Check again
            const [newRooms] = await pool.query(`
              SELECT id, name, created_at 
              FROM chat_rooms 
              WHERE name = ? AND created_by = ?
            `, [roomName, auction.user_id]);
            
            if (newRooms.length > 0) {
              console.log(`   ✅ Chat room created: ID ${newRooms[0].id}\n`);
            } else {
              console.log(`   ❌ Chat room still not found after processing\n`);
            }
          } catch (error) {
            console.error(`   ❌ Error processing:`, error.message);
            console.error(`   Stack:`, error.stack);
          }
        } else {
          console.log(`   ⚠️  Auction already processed, skipping\n`);
        }
      }
    }
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testChatRooms();



