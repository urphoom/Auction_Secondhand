import dotenv from 'dotenv';
import { getPool } from '../utils/db.js';

dotenv.config();

async function main() {
  const pool = await getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      balance DECIMAL(12,2) NOT NULL DEFAULT 0.00
    ) ENGINE=InnoDB;
  `);
  // In case the table exists without balance column (older deployments)
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) NOT NULL DEFAULT 0.00");
  
  // Add bid type columns to existing auctions table
  await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS bid_type ENUM('increment', 'sealed') NOT NULL DEFAULT 'increment'");
  await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_increment DECIMAL(10,2) DEFAULT 1.00");
  await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS buy_now_price DECIMAL(10,2) DEFAULT NULL");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auctions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      start_price DECIMAL(10,2) NOT NULL,
      current_price DECIMAL(10,2) NOT NULL,
      end_time DATETIME NOT NULL,
      user_id INT NOT NULL,
      bid_type ENUM('increment', 'sealed') NOT NULL DEFAULT 'increment',
      minimum_increment DECIMAL(10,2) DEFAULT 1.00,
      buy_now_price DECIMAL(10,2) DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bids (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX (auction_id),
      INDEX (user_id)
    ) ENGINE=InnoDB;
  `);

  // Chat rooms
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INT NOT NULL,
      auction_id INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      INDEX (created_at),
      INDEX (auction_id)
    ) ENGINE=InnoDB;
  `);
  // Add auction_id column to existing chat_rooms table if it doesn't exist
  await pool.query("ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS auction_id INT NULL");
  // Add foreign key constraint if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE chat_rooms 
      ADD CONSTRAINT fk_chat_rooms_auction 
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
    `);
  } catch (error) {
    // Constraint might already exist, ignore
    if (!error.message.includes('Duplicate key name')) {
      console.warn('Could not add foreign key constraint (may already exist):', error.message);
    }
  }

  // Chat messages
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      user_id INT NOT NULL,
      message TEXT,
      image_url VARCHAR(500),
      message_type ENUM('text', 'image') NOT NULL DEFAULT 'text',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX (room_id, created_at),
      INDEX (user_id)
    ) ENGINE=InnoDB;
  `);

  // Notifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      auction_id INT NOT NULL,
      type ENUM('auction_won', 'auction_ended', 'outbid', 'bid_refunded') NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      INDEX (user_id, is_read),
      INDEX (auction_id),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);
  // Add bid_refunded type to existing notifications table if it doesn't exist
  await pool.query("ALTER TABLE notifications MODIFY COLUMN type ENUM('auction_won', 'auction_ended', 'outbid', 'bid_refunded') NOT NULL");
  // eslint-disable-next-line no-console
  console.log('Database initialized');
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


