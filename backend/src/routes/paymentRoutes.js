import { Router } from 'express';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';
import { sendNotificationToUser } from '../sockets/notificationSocket.js';

const router = Router();

// Get payment transactions for user (winner or seller)
router.get('/transactions', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    console.log('🔍 Getting payment transactions for user:', req.user.id);
    const [transactions] = await pool.query(`
      SELECT pt.*, 
             a.title as auction_title,
             a.image as auction_image,
             winner.username as winner_username,
             seller.username as seller_username,
             pe.escrow_amount,
             pe.platform_fee,
             pe.seller_amount,
             pe.status as escrow_status,
             si.tracking_number,
             si.shipping_method,
             si.estimated_delivery,
             si.shipping_address,
             si.notes
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      JOIN users winner ON pt.winner_id = winner.id
      JOIN users seller ON pt.seller_id = seller.id
      LEFT JOIN payment_escrow pe ON pt.id = pe.transaction_id
      LEFT JOIN shipping_info si ON pt.id = si.transaction_id
      WHERE pt.winner_id = ? OR pt.seller_id = ?
      ORDER BY pt.created_at DESC
    `, [req.user.id, req.user.id]);
    
    console.log(`📊 Found ${transactions.length} transactions for user ${req.user.id}:`);
    transactions.forEach(t => {
      console.log(`- "${t.auction_title}" (ID: ${t.id}) - Winner: ${t.winner_username}, Seller: ${t.seller_username}, Status: ${t.status}`);
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error getting payment transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific payment transaction
router.get('/transactions/:id', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    const [transactions] = await pool.query(`
      SELECT pt.*, 
             a.title as auction_title,
             a.description as auction_description,
             a.image as auction_image,
             winner.username as winner_username,
             seller.username as seller_username,
             pe.escrow_amount,
             pe.platform_fee,
             pe.seller_amount,
             pe.status as escrow_status,
             si.shipping_address,
             si.shipping_method,
             si.tracking_number,
             si.estimated_delivery,
             si.actual_delivery,
             si.notes as shipping_notes
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      JOIN users winner ON pt.winner_id = winner.id
      JOIN users seller ON pt.seller_id = seller.id
      LEFT JOIN payment_escrow pe ON pt.id = pe.transaction_id
      LEFT JOIN shipping_info si ON pt.id = si.transaction_id
      WHERE pt.id = ? AND (pt.winner_id = ? OR pt.seller_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transactions[0]);
  } catch (error) {
    console.error('Error getting payment transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create payment transaction (for auction winner)
router.post('/transactions', authRequired, async (req, res) => {
  const { auction_id } = req.body;
  const pool = await getPool();
  
  try {
    // Check if auction exists and user is the winner
    const [auctions] = await pool.query(`
      SELECT a.*, 
             (SELECT b.user_id FROM bids b WHERE b.auction_id = a.id ORDER BY b.amount DESC LIMIT 1) as winner_id,
             (SELECT b.amount FROM bids b WHERE b.auction_id = a.id ORDER BY b.amount DESC LIMIT 1) as winning_amount
      FROM auctions a 
      WHERE a.id = ? AND a.end_time <= NOW()
    `, [auction_id]);
    
    if (auctions.length === 0) {
      return res.status(404).json({ message: 'Auction not found or not ended' });
    }
    
    const auction = auctions[0];
    if (auction.winner_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not the winner of this auction' });
    }
    
    // Check if transaction already exists
    const [existingTransactions] = await pool.query(`
      SELECT id FROM payment_transactions WHERE auction_id = ?
    `, [auction_id]);
    
    if (existingTransactions.length > 0) {
      return res.status(400).json({ message: 'Payment transaction already exists for this auction' });
    }
    
    // Create payment transaction
    const [result] = await pool.query(`
      INSERT INTO payment_transactions (auction_id, winner_id, seller_id, amount, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [auction_id, req.user.id, auction.user_id, auction.winning_amount]);
    
    const transactionId = result.insertId;
    
    // Create escrow record
    const platformFee = auction.winning_amount * 0.05; // 5% platform fee
    const sellerAmount = auction.winning_amount - platformFee;
    
    await pool.query(`
      INSERT INTO payment_escrow (transaction_id, escrow_amount, platform_fee, seller_amount)
      VALUES (?, ?, ?, ?)
    `, [transactionId, auction.winning_amount, platformFee, sellerAmount]);
    
    // Create notifications
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_pending', 'Payment Pending', ?)
    `, [transactionId, req.user.id, `Payment of $${auction.winning_amount} is pending for auction "${auction.title}". Please complete the payment to proceed.`]);
    
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_pending', 'Payment Pending', ?)
    `, [transactionId, auction.user_id, `Payment of $${auction.winning_amount} is pending for auction "${auction.title}". Waiting for winner to complete payment.`]);
    
    res.json({ 
      message: 'Payment transaction created successfully',
      transaction_id: transactionId 
    });
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process payment (winner pays)
router.post('/transactions/:id/pay', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    // Check if transaction exists and user is the winner
    const [transactions] = await pool.query(`
      SELECT pt.*, a.title as auction_title, pe.seller_amount, pe.platform_fee
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      LEFT JOIN payment_escrow pe ON pt.id = pe.transaction_id
      WHERE pt.id = ? AND pt.winner_id = ? AND pt.status = 'pending'
    `, [req.params.id, req.user.id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not pending' });
    }
    
    const transaction = transactions[0];
    
    // Update transaction status
    await pool.query(`
      UPDATE payment_transactions 
      SET status = 'paid', paid_at = NOW() 
      WHERE id = ?
    `, [req.params.id]);
    
    // Keep escrow status as 'held' (money stays in escrow until delivery confirmation)
    await pool.query(`
      UPDATE payment_escrow 
      SET status = 'held' 
      WHERE transaction_id = ?
    `, [req.params.id]);
    
    // Don't release money to seller yet - wait for delivery confirmation
    
    // Create notifications for seller
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_received', 'Payment Received', ?)
    `, [req.params.id, transaction.seller_id, 
        `Payment received for auction "${transaction.auction_title}": $${transaction.seller_amount} (Platform fee: $${transaction.platform_fee}). Money is held in escrow until buyer confirms delivery.`]);
    
    // Create notifications for winner
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_received', 'Payment Processed', ?)
    `, [req.params.id, req.user.id, 
        `Payment of $${transaction.amount} has been processed for auction "${transaction.auction_title}". Waiting for seller to ship the item.`]);
    
    console.log(`💰 Payment processed: Auction "${transaction.auction_title}"`);
    console.log(`   Total Amount: $${transaction.amount}`);
    console.log(`   Seller Amount: $${transaction.seller_amount} (held in escrow)`);
    console.log(`   Platform Fee: $${transaction.platform_fee}`);
    console.log(`   Seller ID: ${transaction.seller_id}`);
    console.log(`   Status: Money held in escrow until delivery confirmation`);
    
    res.json({ 
      message: 'Payment processed successfully',
      seller_amount: transaction.seller_amount,
      platform_fee: transaction.platform_fee
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ship item (seller ships)
router.post('/transactions/:id/ship', authRequired, async (req, res) => {
  const { shipping_address, shipping_method, tracking_number, estimated_delivery, notes } = req.body;
  const pool = await getPool();
  
  try {
    // Check if transaction exists and user is the seller
    const [transactions] = await pool.query(`
      SELECT pt.*, a.title as auction_title
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      WHERE pt.id = ? AND pt.seller_id = ? AND pt.status = 'paid'
    `, [req.params.id, req.user.id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not paid' });
    }
    
    const transaction = transactions[0];
    
    // Update transaction status
    await pool.query(`
      UPDATE payment_transactions 
      SET status = 'shipped', shipped_at = NOW() 
      WHERE id = ?
    `, [req.params.id]);
    
    // Create or update shipping info
    await pool.query(`
      INSERT INTO shipping_info (transaction_id, shipping_address, shipping_method, tracking_number, estimated_delivery, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      shipping_address = VALUES(shipping_address),
      shipping_method = VALUES(shipping_method),
      tracking_number = VALUES(tracking_number),
      estimated_delivery = VALUES(estimated_delivery),
      notes = VALUES(notes)
    `, [req.params.id, shipping_address, shipping_method, tracking_number, estimated_delivery, notes]);
    
    // Create notifications
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'item_shipped', 'Item Shipped', ?)
    `, [req.params.id, transaction.winner_id, `📦 Your item from auction "${transaction.auction_title}" has been shipped! Tracking: ${tracking_number || 'N/A'}. Please confirm delivery when you receive it.`]);
    
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'item_shipped', 'Item Shipped', ?)
    `, [req.params.id, req.user.id, `📦 You have shipped the item for auction "${transaction.auction_title}". Tracking: ${tracking_number || 'N/A'}. Waiting for buyer confirmation.`]);
    
    res.json({ message: 'Item shipped successfully' });
  } catch (error) {
    console.error('Error shipping item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Confirm delivery (winner confirms receipt)
router.post('/transactions/:id/deliver', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    console.log(`🚚 Attempting to confirm delivery for transaction ${req.params.id} by user ${req.user.id}`);
    
    // First check if transaction exists at all
    const [allTransactions] = await pool.query(`
      SELECT pt.*, a.title as auction_title
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      WHERE pt.id = ?
    `, [req.params.id]);
    
    if (allTransactions.length === 0) {
      console.log(`❌ Transaction ${req.params.id} does not exist`);
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const allTransaction = allTransactions[0];
    console.log(`📊 Transaction exists: ID=${allTransaction.id}, Winner=${allTransaction.winner_id}, Seller=${allTransaction.seller_id}, Status=${allTransaction.status}`);
    
    // Check if user is the winner
    if (allTransaction.winner_id !== req.user.id) {
      console.log(`❌ User ${req.user.id} is not the winner. Winner is ${allTransaction.winner_id}`);
      return res.status(403).json({ message: 'You are not the winner of this transaction' });
    }
    
    const transaction = allTransaction;
    console.log(`📊 Transaction found: ID=${transaction.id}, Status=${transaction.status}, Winner=${transaction.winner_id}`);
    
    if (transaction.status !== 'shipped') {
      console.log(`❌ Transaction ${req.params.id} is not in 'shipped' status. Current status: ${transaction.status}`);
      return res.status(400).json({ message: `Transaction is not in shipped status. Current status: ${transaction.status}` });
    }
    
    console.log(`✅ Updating transaction ${req.params.id} status to 'delivered'`);
    
    // Update transaction status
    await pool.query(`
      UPDATE payment_transactions 
      SET status = 'delivered', delivered_at = NOW() 
      WHERE id = ?
    `, [req.params.id]);
    
    console.log(`✅ Updating escrow status to 'released' for transaction ${req.params.id}`);
    
    // Update escrow status
    await pool.query(`
      UPDATE payment_escrow 
      SET status = 'released' 
      WHERE transaction_id = ?
    `, [req.params.id]);
    
    // Get seller amount from escrow table
    const [escrowRows] = await pool.query(`
      SELECT seller_amount FROM payment_escrow WHERE transaction_id = ?
    `, [req.params.id]);
    
    if (escrowRows.length === 0) {
      console.log(`❌ No escrow record found for transaction ${req.params.id}`);
      return res.status(400).json({ message: 'No escrow record found for this transaction' });
    }
    
    const sellerAmount = escrowRows[0].seller_amount;
    console.log(`💰 Releasing payment of ${sellerAmount} to seller ${transaction.seller_id}`);
    
    // Release payment to seller
    await pool.query(`
      UPDATE users 
      SET balance = balance + ? 
      WHERE id = ?
    `, [sellerAmount, transaction.seller_id]);
    
    console.log(`📧 Creating notifications for delivery confirmation`);
    
    // Create notifications
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'item_delivered', 'Item Delivered', ?)
    `, [req.params.id, transaction.seller_id, `🎉 Great news! The buyer has confirmed receiving the item from auction "${transaction.auction_title}". Payment of $${sellerAmount} has been released to your account.`]);
    
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'item_delivered', 'Item Delivered', ?)
    `, [req.params.id, req.user.id, `✅ You have confirmed receipt of the item from auction "${transaction.auction_title}". The seller has been notified and payment has been released.`]);
    
    console.log(`✅ Delivery confirmation completed successfully for transaction ${req.params.id}`);
    res.json({ message: 'Delivery confirmed successfully' });
  } catch (error) {
    console.error('❌ Error confirming delivery:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Complete transaction (final step)
router.post('/transactions/:id/complete', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    // Check if transaction exists and user is the winner
    const [transactions] = await pool.query(`
      SELECT pt.*, a.title as auction_title
      FROM payment_transactions pt
      JOIN auctions a ON pt.auction_id = a.id
      WHERE pt.id = ? AND pt.winner_id = ? AND pt.status = 'delivered'
    `, [req.params.id, req.user.id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not delivered' });
    }
    
    const transaction = transactions[0];
    
    // Update transaction status
    await pool.query(`
      UPDATE payment_transactions 
      SET status = 'completed', completed_at = NOW() 
      WHERE id = ?
    `, [req.params.id]);
    
    // Create notifications
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_released', 'Transaction Completed', ?)
    `, [req.params.id, transaction.seller_id, `Transaction for auction "${transaction.auction_title}" has been completed successfully.`]);
    
    await pool.query(`
      INSERT INTO payment_notifications (transaction_id, user_id, type, title, message)
      VALUES (?, ?, 'payment_released', 'Transaction Completed', ?)
    `, [req.params.id, req.user.id, `Transaction for auction "${transaction.auction_title}" has been completed successfully.`]);
    
    res.json({ message: 'Transaction completed successfully' });
  } catch (error) {
    console.error('Error completing transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment notifications
router.get('/notifications', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    const [notifications] = await pool.query(`
      SELECT pn.*, pt.auction_id, a.title as auction_title
      FROM payment_notifications pn
      JOIN payment_transactions pt ON pn.transaction_id = pt.id
      JOIN auctions a ON pt.auction_id = a.id
      WHERE pn.user_id = ?
      ORDER BY pn.created_at DESC
    `, [req.user.id]);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error getting payment notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    await pool.query(`
      UPDATE payment_notifications 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user balance
router.get('/balance', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    const [users] = await pool.query(`
      SELECT balance FROM users WHERE id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ balance: users[0].balance });
  } catch (error) {
    console.error('Error getting user balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
