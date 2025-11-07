import dotenv from 'dotenv';
import { getPool } from '../utils/db.js';

dotenv.config();

async function main() {
  const pool = await getPool();
  
  try {
    // Check if auction_id column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'chat_rooms' 
      AND COLUMN_NAME = 'auction_id'
    `);
    
    if (columns.length === 0) {
      console.log('Adding auction_id column to chat_rooms table...');
      
      // Add auction_id column
      await pool.query('ALTER TABLE chat_rooms ADD COLUMN auction_id INT NULL');
      
      // Add foreign key constraint
      await pool.query(`
        ALTER TABLE chat_rooms 
        ADD CONSTRAINT fk_chat_rooms_auction 
        FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
      `);
      
      // Update existing winner chat rooms with auction_id
      // Extract auction title from room name and match with auctions
      const [allRooms] = await pool.query(`
        SELECT id, name, created_by 
        FROM chat_rooms 
        WHERE name LIKE '%Winner Chat%'
      `);
      
      for (const room of allRooms) {
        // Extract auction title from room name: "🏆 {title} - Winner Chat"
        const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
        if (match) {
          const auctionTitle = match[1];
          
          // Find auction with this title and created_by (seller)
          const [auctions] = await pool.query(`
            SELECT id FROM auctions 
            WHERE title = ? AND user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
          `, [auctionTitle, room.created_by]);
          
          if (auctions.length > 0) {
            await pool.query(`
              UPDATE chat_rooms 
              SET auction_id = ? 
              WHERE id = ?
            `, [auctions[0].id, room.id]);
            console.log(`Updated chat room ${room.id} with auction_id ${auctions[0].id}`);
          }
        }
      }
      
      console.log('✅ Successfully added auction_id column to chat_rooms');
    } else {
      console.log('✅ auction_id column already exists in chat_rooms');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();


