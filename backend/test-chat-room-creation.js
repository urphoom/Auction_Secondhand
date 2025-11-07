import dotenv from 'dotenv';
import { getPool } from './src/utils/db.js';

dotenv.config();

async function testChatRoomCreation() {
  const pool = await getPool();
  
  try {
    console.log('🔍 Testing chat room creation...');
    
    // Get a recent ended auction with bids
    const [auctions] = await pool.query(`
      SELECT a.*, 
             (SELECT u.username FROM users u WHERE u.id = a.user_id) as owner_username
      FROM auctions a 
      WHERE a.end_time <= NOW() 
      AND a.id IN (SELECT DISTINCT auction_id FROM bids)
      ORDER BY a.end_time DESC
      LIMIT 5
    `);
    
    console.log(`Found ${auctions.length} recent ended auctions with bids`);
    
    for (const auction of auctions) {
      console.log(`\n📦 Testing auction ${auction.id}: "${auction.title}"`);
      console.log(`   Ended at: ${auction.end_time}`);
      console.log(`   Seller: ${auction.owner_username} (ID: ${auction.user_id})`);
      
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
        console.log('   ⚠️  No bids found');
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
        console.log(`   ✅ Chat room exists: ID ${existingRooms[0].id}, created at ${existingRooms[0].created_at}`);
      } else {
        console.log(`   ❌ Chat room NOT FOUND`);
        console.log(`      Expected name: "${roomName}"`);
        console.log(`      Created by: ${auction.user_id}`);
        
        // Check if any winner chat room exists for this auction
        const [anyRooms] = await pool.query(`
          SELECT id, name, created_by 
          FROM chat_rooms 
          WHERE name LIKE ? AND created_by = ?
        `, [`%${auction.title}%Winner Chat%`, auction.user_id]);
        
        if (anyRooms.length > 0) {
          console.log(`   ⚠️  Found similar room: "${anyRooms[0].name}" (ID: ${anyRooms[0].id})`);
        } else {
          console.log(`   ❌ No similar rooms found`);
        }
      }
      
      // Check if payment transaction exists
      const [payments] = await pool.query(`
        SELECT id, winner_id, amount, status, created_at
        FROM payment_transactions
        WHERE auction_id = ?
      `, [auction.id]);
      
      if (payments.length > 0) {
        console.log(`   ✅ Payment transaction exists: ID ${payments[0].id}, winner: ${payments[0].winner_id}`);
      } else {
        console.log(`   ❌ Payment transaction NOT FOUND`);
      }
      
      // Check if notifications exist
      const [notifications] = await pool.query(`
        SELECT id, type, user_id, created_at
        FROM notifications
        WHERE auction_id = ?
        ORDER BY created_at DESC
      `, [auction.id]);
      
      console.log(`   📬 Notifications: ${notifications.length} found`);
      notifications.forEach(n => {
        console.log(`      - ${n.type} for user ${n.user_id} (ID: ${n.id}, ${n.created_at})`);
      });
    }
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testChatRoomCreation();



