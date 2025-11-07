import dotenv from 'dotenv';
import { getPool } from '../utils/db.js';

dotenv.config();

async function main() {
  const pool = await getPool();
  
  try {
    // Check if buy_now_price column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'auctions' 
      AND COLUMN_NAME = 'buy_now_price'
    `);
    
    if (columns.length === 0) {
      console.log('Adding buy_now_price column to auctions table...');
      await pool.query('ALTER TABLE auctions ADD COLUMN buy_now_price DECIMAL(10,2) DEFAULT NULL');
      console.log('✅ Successfully added buy_now_price column');
    } else {
      console.log('✅ buy_now_price column already exists');
    }
    
    // Check if bid_refunded notification type exists
    const [notificationTypes] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'notifications' 
      AND COLUMN_NAME = 'type'
    `);
    
    if (notificationTypes.length > 0 && !notificationTypes[0].COLUMN_TYPE.includes('bid_refunded')) {
      console.log('Adding bid_refunded to notification types...');
      await pool.query("ALTER TABLE notifications MODIFY COLUMN type ENUM('auction_won', 'auction_ended', 'outbid', 'bid_refunded') NOT NULL");
      console.log('✅ Successfully added bid_refunded notification type');
    } else {
      console.log('✅ bid_refunded notification type already exists');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();


