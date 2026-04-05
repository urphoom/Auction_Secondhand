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
  // Trust / rating cache
  try { await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00"); } catch {}
  try { await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0"); } catch {}
  
  // Auctions (create first; then apply ALTERs for older deployments)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auctions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      images JSON NULL,
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

  // Add/patch columns for older deployments (ignore if table/column already exists or engine doesn't support IF NOT EXISTS)
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS bid_type ENUM('increment', 'sealed') NOT NULL DEFAULT 'increment'"); } catch {}
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_increment DECIMAL(10,2) DEFAULT 1.00"); } catch {}
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS buy_now_price DECIMAL(10,2) DEFAULT NULL"); } catch {}
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS images JSON NULL"); } catch {}
  // New columns: status, winner_id, and indexes/constraints
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS status ENUM('active','ended','cancelled') NOT NULL DEFAULT 'active' AFTER end_time"); } catch {}
  try { await pool.query("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_id INT NULL AFTER status"); } catch {}
  // Indexes for auctions
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status)"); } catch {}
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_auctions_user_id ON auctions(user_id)"); } catch {}
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time)"); } catch {}
  // Foreign key to users for winner_id (ignore if already exists)
  try {
    await pool.query(`
      ALTER TABLE auctions
      ADD CONSTRAINT fk_auctions_winner
      FOREIGN KEY (winner_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  } catch (err) {
    // Likely already exists
  }
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

  // Payments (needed for review eligibility validation)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      winner_id INT NOT NULL,
      seller_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      status ENUM('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
      payment_method VARCHAR(50) DEFAULT 'escrow',
      payment_reference VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME NULL,
      shipped_at DATETIME NULL,
      delivered_at DATETIME NULL,
      completed_at DATETIME NULL,
      INDEX (auction_id),
      INDEX (winner_id),
      INDEX (seller_id),
      INDEX (status)
    ) ENGINE=InnoDB;
  `);
  // FK constraints (best-effort)
  try {
    await pool.query(`
      ALTER TABLE payment_transactions
      ADD CONSTRAINT fk_payment_auction
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
    `);
  } catch {}
  try {
    await pool.query(`
      ALTER TABLE payment_transactions
      ADD CONSTRAINT fk_payment_winner
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
    `);
  } catch {}
  try {
    await pool.query(`
      ALTER TABLE payment_transactions
      ADD CONSTRAINT fk_payment_seller
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    `);
  } catch {}

  // Reviews table for buyer reviewing seller after completed payment
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_id INT NOT NULL,
      auction_id INT UNSIGNED NOT NULL,
      seller_id INT UNSIGNED NOT NULL,
      buyer_id INT UNSIGNED NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      comment TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_review_order (order_id),
      UNIQUE KEY uq_review_auction_buyer (auction_id, buyer_id),
      CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES payment_transactions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_reviews_auction FOREIGN KEY (auction_id) REFERENCES auctions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_reviews_seller FOREIGN KEY (seller_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_reviews_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
    ) ENGINE=InnoDB;
  `);
  // Patch older deployments that created reviews before order_id existed
  try { await pool.query("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INT NOT NULL AFTER id"); } catch {}
  try { await pool.query("ALTER TABLE reviews ADD UNIQUE INDEX IF NOT EXISTS uq_review_order (order_id)"); } catch {}
  try {
    await pool.query(`
      ALTER TABLE reviews
      ADD CONSTRAINT fk_reviews_order
      FOREIGN KEY (order_id) REFERENCES payment_transactions(id)
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  } catch {}
  // Helpful indexes for reviews
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_reviews_auction_id ON reviews(auction_id)"); } catch {}
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id)"); } catch {}
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id)"); } catch {}
  try { await pool.query("CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id)"); } catch {}

  // Trigger: when a new review is inserted, recalc seller avg/count using only completed orders
  try { await pool.query('DROP TRIGGER IF EXISTS trg_reviews_after_insert'); } catch {}
  try {
    await pool.query(`
      CREATE TRIGGER trg_reviews_after_insert
      AFTER INSERT ON reviews
      FOR EACH ROW
      UPDATE users u
      SET
        u.average_rating = (
          SELECT IFNULL(AVG(r.rating), 0)
          FROM reviews r
          JOIN payment_transactions pt ON pt.id = r.order_id
          WHERE r.seller_id = NEW.seller_id AND pt.status = 'completed'
        ),
        u.review_count = (
          SELECT COUNT(*)
          FROM reviews r
          JOIN payment_transactions pt ON pt.id = r.order_id
          WHERE r.seller_id = NEW.seller_id AND pt.status = 'completed'
        )
      WHERE u.id = NEW.seller_id
    `);
  } catch (err) {
    // ignore if permissions/restrictions prevent triggers
  }

  // Chat rooms
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INT UNSIGNED NOT NULL,
      auction_id INT UNSIGNED NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      INDEX (created_at),
      INDEX (auction_id)
    ) ENGINE=InnoDB;
  `);
  // Add auction_id column to existing chat_rooms table if it doesn't exist
  await pool.query("ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS auction_id INT UNSIGNED NULL");
  // Ensure created_by and auction_id use unsigned to match referenced columns
  try {
    await pool.query('ALTER TABLE chat_rooms MODIFY COLUMN id INT UNSIGNED AUTO_INCREMENT');
  } catch (error) {
    // ignore
  }
  try {
    await pool.query('ALTER TABLE chat_rooms MODIFY COLUMN created_by INT UNSIGNED NOT NULL');
  } catch (error) {
    if (!error.message.includes('needs to be valid') && !error.message.includes('errno: 1265')) {
      // ignore if incompatible data etc.
    }
  }
  try {
    await pool.query('ALTER TABLE chat_rooms MODIFY COLUMN auction_id INT UNSIGNED NULL');
  } catch (error) {
    if (!error.message.includes('needs to be valid') && !error.message.includes('errno: 1265')) {
      // ignore
    }
  }
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
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      room_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
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
  try {
    await pool.query('ALTER TABLE chat_messages MODIFY COLUMN id INT UNSIGNED AUTO_INCREMENT');
  } catch (error) {
    // ignore
  }
  try {
    await pool.query('ALTER TABLE chat_messages MODIFY COLUMN room_id INT UNSIGNED NOT NULL');
    await pool.query('ALTER TABLE chat_messages MODIFY COLUMN user_id INT UNSIGNED NOT NULL');
  } catch (error) {
    if (!error.message.includes('needs to be valid') && !error.message.includes('errno: 1265')) {
      // ignore
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS top_up_requests (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      slip_url VARCHAR(255),
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      note TEXT,
      processed_by INT UNSIGNED NULL,
      processed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX (status),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS top_up_request_logs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_id INT UNSIGNED NOT NULL,
      actor_id INT UNSIGNED NULL,
      actor_type ENUM('user', 'admin', 'system') NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES top_up_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX (request_id),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);

  // Withdrawals
  await pool.query(`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      payout_amount DECIMAL(12,2) NOT NULL,
      bank_name VARCHAR(100) NOT NULL,
      account_number VARCHAR(50) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      note TEXT,
      slip_url VARCHAR(255),
      processed_by INT UNSIGNED NULL,
      processed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX (status),
      INDEX (created_at),
      INDEX (user_id)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS withdrawal_request_logs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_id INT UNSIGNED NOT NULL,
      actor_id INT UNSIGNED NULL,
      actor_type ENUM('user', 'admin', 'system') NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX (request_id),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      admin_id INT UNSIGNED NOT NULL,
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100),
      target_id INT UNSIGNED,
      details TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX (admin_id),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);

  // Notifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      auction_id INT UNSIGNED NULL,
      type ENUM('auction_won', 'auction_ended', 'outbid', 'bid_refunded', 'topup_created', 'topup_approved', 'topup_rejected', 'withdrawal_created', 'withdrawal_approved', 'withdrawal_rejected') NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      context JSON NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      INDEX (user_id, is_read),
      INDEX (auction_id),
      INDEX (created_at)
    ) ENGINE=InnoDB;
  `);
  try {
    await pool.query("ALTER TABLE notifications MODIFY COLUMN auction_id INT UNSIGNED NULL");
  } catch (err) {
    if (err.code !== 'ER_BAD_FIELD_ERROR') console.warn('Could not alter notifications auction_id:', err.message);
  }
  try {
    await pool.query("ALTER TABLE notifications MODIFY COLUMN type ENUM('auction_won', 'auction_ended', 'outbid', 'bid_refunded', 'topup_created', 'topup_approved', 'topup_rejected', 'withdrawal_created', 'withdrawal_approved', 'withdrawal_rejected') NOT NULL");
  } catch (err) {
    console.warn('Could not update notifications type enum:', err.message);
  }
  try {
    await pool.query("ALTER TABLE notifications ADD COLUMN context JSON NULL");
  } catch (err) {
    if (!err.message?.includes('Duplicate column name')) console.warn('Could not add notifications context column:', err.message);
  }
  try {
    await pool.query("ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(100) DEFAULT NULL AFTER transaction_id");
  } catch (err) {
    if (!['ER_BAD_TABLE_ERROR', 'ER_DUP_FIELDNAME'].includes(err.code)) console.warn('Could not add recipient_name to shipping_info:', err.message);
  }
  try {
    await pool.query("ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20) DEFAULT NULL AFTER recipient_name");
  } catch (err) {
    if (!['ER_BAD_TABLE_ERROR', 'ER_DUP_FIELDNAME'].includes(err.code)) console.warn('Could not add recipient_phone to shipping_info:', err.message);
  }
  try {
    await pool.query("ALTER TABLE shipping_info ADD UNIQUE INDEX IF NOT EXISTS uniq_shipping_transaction (transaction_id)");
  } catch (err) {
    if (!['ER_BAD_TABLE_ERROR', 'ER_DUP_KEYNAME'].includes(err.code)) console.warn('Could not add unique index to shipping_info:', err.message);
  }
  // eslint-disable-next-line no-console
  console.log('Database initialized');
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


