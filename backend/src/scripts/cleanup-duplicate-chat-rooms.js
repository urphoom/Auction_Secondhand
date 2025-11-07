import { getPool } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupDuplicateChatRooms() {
  console.log('🔍 Checking for duplicate chat rooms...\n');
  
  const pool = await getPool();
  
  try {
    // 1. Find duplicate chat rooms by name and created_by
    console.log('1. Finding duplicate chat rooms...');
    const [duplicates] = await pool.query(`
      SELECT name, created_by, COUNT(*) as count, GROUP_CONCAT(id ORDER BY created_at ASC) as room_ids
      FROM chat_rooms
      WHERE name LIKE '%Winner Chat%'
      GROUP BY name, created_by
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate chat rooms found!\n');
    } else {
      console.log(`⚠️  Found ${duplicates.length} sets of duplicate chat rooms:\n`);
      
      for (const dup of duplicates) {
        const roomIds = dup.room_ids.split(',').map(id => parseInt(id));
        const keepId = roomIds[0]; // Keep the first one (oldest)
        const deleteIds = roomIds.slice(1); // Delete the rest
        
        console.log(`   - "${dup.name}" (created_by: ${dup.created_by})`);
        console.log(`     Total: ${dup.count} rooms`);
        console.log(`     Keeping room ID: ${keepId}`);
        console.log(`     Deleting room IDs: ${deleteIds.join(', ')}`);
        
        for (const roomId of deleteIds) {
          // Delete related chat messages first
          await pool.query(`
            DELETE FROM chat_messages 
            WHERE room_id = ?
          `, [roomId]);
          
          console.log(`       ✅ Deleted messages for room ID ${roomId}`);
          
          // Delete the chat room
          await pool.query(`
            DELETE FROM chat_rooms 
            WHERE id = ?
          `, [roomId]);
          
          console.log(`       ✅ Deleted chat room ID ${roomId}`);
        }
      }
      
      console.log('\n✅ All duplicate chat rooms have been removed!\n');
    }
    
    // 2. Check if unique constraint exists (optional - for future reference)
    console.log('2. Checking table structure...');
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM chat_rooms LIKE 'auction_id'
    `);
    
    if (columns.length === 0) {
      console.log('   ℹ️  Note: chat_rooms table does not have auction_id column.');
      console.log('   ℹ️  Current duplicate prevention relies on name + created_by combination.');
    } else {
      console.log('   ✅ chat_rooms table has auction_id column.');
    }
    
    console.log('\n🎉 Cleanup completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the cleanup
cleanupDuplicateChatRooms()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });



