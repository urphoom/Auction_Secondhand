import { getPool } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createPaymentSystem() {
  console.log('🚀 Creating Payment System Database Schema...\n');
  
  const pool = await getPool();
  
  try {
    // 1. Create payment_transactions table
    console.log('1. Creating payment_transactions table...');
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
    
    // Add foreign key constraints separately
    try {
      await pool.query(`
        ALTER TABLE payment_transactions 
        ADD CONSTRAINT fk_payment_auction 
        FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('Note: Foreign key constraint for auction_id may already exist');
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE payment_transactions 
        ADD CONSTRAINT fk_payment_winner 
        FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('Note: Foreign key constraint for winner_id may already exist');
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE payment_transactions 
        ADD CONSTRAINT fk_payment_seller 
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('Note: Foreign key constraint for seller_id may already exist');
      }
    }
    console.log('✅ payment_transactions table created');
    
    // 2. Create shipping_info table
    console.log('\n2. Creating shipping_info table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_method VARCHAR(100) DEFAULT 'standard',
        tracking_number VARCHAR(255),
        estimated_delivery DATE,
        actual_delivery DATE,
        notes TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
        INDEX (transaction_id)
      ) ENGINE=InnoDB;
    `);
    console.log('✅ shipping_info table created');
    
    // 3. Create payment_escrow table
    console.log('\n3. Creating payment_escrow table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_escrow (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        escrow_amount DECIMAL(12,2) NOT NULL,
        platform_fee DECIMAL(12,2) DEFAULT 0.00,
        seller_amount DECIMAL(12,2) NOT NULL,
        status ENUM('held', 'released', 'refunded') NOT NULL DEFAULT 'held',
        held_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        released_at DATETIME NULL,
        refunded_at DATETIME NULL,
        FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
        INDEX (transaction_id),
        INDEX (status)
      ) ENGINE=InnoDB;
    `);
    console.log('✅ payment_escrow table created');
    
    // 4. Create payment_notifications table
    console.log('\n4. Creating payment_notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('payment_pending', 'payment_received', 'item_shipped', 'item_delivered', 'payment_released', 'payment_refunded') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (transaction_id),
        INDEX (user_id),
        INDEX (type),
        INDEX (is_read)
      ) ENGINE=InnoDB;
    `);
    
    // Add foreign key constraints separately
    try {
      await pool.query(`
        ALTER TABLE payment_notifications 
        ADD CONSTRAINT fk_payment_notif_transaction 
        FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('Note: Foreign key constraint for transaction_id may already exist');
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE payment_notifications 
        ADD CONSTRAINT fk_payment_notif_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('Note: Foreign key constraint for user_id may already exist');
      }
    }
    console.log('✅ payment_notifications table created');
    
    // 5. Add balance column to users table if not exists
    console.log('\n5. Checking users table balance column...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN balance DECIMAL(12,2) NOT NULL DEFAULT 0.00');
      console.log('✅ balance column added to users table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ balance column already exists in users table');
      } else {
        throw error;
      }
    }
    
    // 6. Create indexes for better performance
    console.log('\n6. Creating additional indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status_created 
      ON payment_transactions(status, created_at);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_winner_status 
      ON payment_transactions(winner_id, status);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_seller_status 
      ON payment_transactions(seller_id, status);
    `);
    
    console.log('✅ Additional indexes created');
    
    // 7. Insert sample data for testing
    console.log('\n7. Creating sample payment transactions...');
    
    // Get some ended auctions with winners
    const [endedAuctions] = await pool.query(`
      SELECT a.*, 
             (SELECT b.user_id FROM bids b WHERE b.auction_id = a.id ORDER BY b.amount DESC LIMIT 1) as winner_id
      FROM auctions a 
      WHERE a.end_time <= NOW() 
      AND EXISTS (SELECT 1 FROM bids b WHERE b.auction_id = a.id)
      LIMIT 3
    `);
    
    for (const auction of endedAuctions) {
      if (auction.winner_id) {
        // Get winner's highest bid amount
        const [winnerBid] = await pool.query(`
          SELECT amount FROM bids 
          WHERE auction_id = ? AND user_id = ? 
          ORDER BY amount DESC LIMIT 1
        `, [auction.id, auction.winner_id]);
        
        if (winnerBid.length > 0) {
          const amount = winnerBid[0].amount;
          const platformFee = amount * 0.05; // 5% platform fee
          const sellerAmount = amount - platformFee;
          
          // Create payment transaction
          const [transactionResult] = await pool.query(`
            INSERT INTO payment_transactions (auction_id, winner_id, seller_id, amount, status)
            VALUES (?, ?, ?, ?, 'pending')
          `, [auction.id, auction.winner_id, auction.user_id, amount]);
          
          const transactionId = transactionResult.insertId;
          
          // Create escrow record
          await pool.query(`
            INSERT INTO payment_escrow (transaction_id, escrow_amount, platform_fee, seller_amount)
            VALUES (?, ?, ?, ?)
          `, [transactionId, amount, platformFee, sellerAmount]);
          
          console.log(`✅ Created payment transaction for auction "${auction.title}" (ID: ${transactionId})`);
        }
      }
    }
    
    console.log('\n🎉 Payment System Database Schema created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating payment system:', error);
  } finally {
    await pool.end();
  }
}

createPaymentSystem();
