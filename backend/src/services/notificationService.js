import { getPool } from '../utils/db.js';
import { sendNotificationToUser } from '../sockets/notificationSocket.js';

export class NotificationService {
  static async checkAndProcessEndedAuctions(io = null) {
    const pool = await getPool();
    
    try {
      // Find auctions that have just ended (within the last minute)
      // Use FOR UPDATE to lock rows and prevent concurrent processing
      // Check both notifications and payment_transactions to prevent duplicates
      const conn = await pool.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // First, try to find auctions that ended in the last minute (recent)
        let [endedAuctions] = await conn.query(`
          SELECT a.*, 
                 (SELECT u.username FROM users u WHERE u.id = a.user_id) as owner_username
          FROM auctions a 
          WHERE a.end_time <= NOW() 
          AND a.end_time >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
          AND a.id NOT IN (
            SELECT DISTINCT auction_id 
            FROM notifications 
            WHERE type = 'auction_won' OR type = 'auction_ended'
          )
          AND a.id NOT IN (
            SELECT DISTINCT auction_id 
            FROM payment_transactions
          )
          AND (
            a.bid_type = 'increment' 
            OR a.bid_type = 'sealed' AND a.id NOT IN (
              SELECT DISTINCT auction_id 
              FROM notifications 
              WHERE type = 'bid_refunded'
            )
          )
          FOR UPDATE
        `);
        
        // If no recent auctions, also check for older unprocessed auctions (up to 24 hours)
        if (endedAuctions.length === 0) {
          console.log(`[Auction Checker] No recent auctions found, checking for older unprocessed auctions...`);
          [endedAuctions] = await conn.query(`
            SELECT a.*, 
                   (SELECT u.username FROM users u WHERE u.id = a.user_id) as owner_username
            FROM auctions a 
            WHERE a.end_time <= NOW() 
            AND a.end_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            AND a.id NOT IN (
              SELECT DISTINCT auction_id 
              FROM notifications 
              WHERE type = 'auction_won' OR type = 'auction_ended'
            )
            AND a.id NOT IN (
              SELECT DISTINCT auction_id 
              FROM payment_transactions
            )
            AND (
              a.bid_type = 'increment' 
              OR a.bid_type = 'sealed' AND a.id NOT IN (
                SELECT DISTINCT auction_id 
                FROM notifications 
                WHERE type = 'bid_refunded'
              )
            )
            FOR UPDATE
          `);
        }
        
        console.log(`[Auction Checker] Found ${endedAuctions.length} ended auction(s) to process`);
        if (endedAuctions.length > 0) {
          endedAuctions.forEach(auction => {
            console.log(`  - Auction ${auction.id}: "${auction.title}" (ended at ${auction.end_time})`);
          });
        }

        await conn.commit();
        
        // Process auctions outside transaction to avoid long locks
        for (const auction of endedAuctions) {
          console.log(`[Auction Checker] Processing auction ${auction.id}...`);
          await this.processAuctionEnd(auction, io);
        }
      } catch (error) {
        await conn.rollback();
        console.error('[Auction Checker] Error in transaction:', error);
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('[Auction Checker] Error checking ended auctions:', error);
      console.error('[Auction Checker] Error stack:', error.stack);
    }
  }

  static async processAuctionEnd(auction, io = null) {
    const pool = await getPool();
    const conn = await pool.getConnection();
    
    try {
      console.log(`[processAuctionEnd] Starting processing for auction ${auction.id}...`);
      await conn.beginTransaction();
      
      // Double-check: Verify auction hasn't been processed yet with FOR UPDATE lock
      // Check if winner notification or payment transaction already exists
      const [existingWinnerNotification] = await conn.query(`
        SELECT id FROM notifications 
        WHERE auction_id = ? AND type = 'auction_won'
        FOR UPDATE
      `, [auction.id]);
      
      const [existingPaymentTransaction] = await conn.query(`
        SELECT id FROM payment_transactions 
        WHERE auction_id = ?
        FOR UPDATE
      `, [auction.id]);
      
      if (existingWinnerNotification.length > 0 || existingPaymentTransaction.length > 0) {
        console.log(`[processAuctionEnd] Auction ${auction.id} already processed (has winner notification: ${existingWinnerNotification.length > 0}, has payment transaction: ${existingPaymentTransaction.length > 0}), skipping...`);
        await conn.rollback();
        return;
      }
      
      // Get all bids for this auction
      const [allBids] = await conn.query(`
        SELECT b.*, u.username, u.id as user_id
        FROM bids b
        JOIN users u ON b.user_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.amount DESC, b.created_at ASC
      `, [auction.id]);

      console.log(`[processAuctionEnd] Auction ${auction.id} has ${allBids.length} bid(s)`);

      if (allBids.length > 0) {
        const winner = allBids[0]; // Highest bidder is the winner
        
        // Handle refunds for sealed bidding
        if (auction.bid_type === 'sealed') {
          // Refund all non-winning bids for sealed auctions
          const nonWinners = allBids.slice(1); // All bids except the winner
          
          for (const bid of nonWinners) {
            // Check if refund notification already exists to prevent duplicate refunds
            const [existingRefundNotification] = await conn.query(`
              SELECT id FROM notifications 
              WHERE user_id = ? AND auction_id = ? AND type = 'bid_refunded'
              FOR UPDATE
            `, [bid.user_id, auction.id]);
            
            // Only refund if no refund notification exists
            if (existingRefundNotification.length === 0) {
              // Refund the bid amount to the user's balance
              await conn.query(`
                UPDATE users 
                SET balance = balance + ? 
                WHERE id = ?
              `, [bid.amount, bid.user_id]);
              
              // Create refund notification within the same transaction
              const [refundNotificationResult] = await conn.query(`
                INSERT INTO notifications (user_id, auction_id, type, title, message)
                VALUES (?, ?, ?, ?, ?)
              `, [bid.user_id, auction.id, 'bid_refunded', '💰 Bid Refunded', 
                  `Your bid of $${Number(bid.amount).toFixed(2)} for "${auction.title}" has been refunded. You did not win this sealed auction.`]);
              
              // Send real-time notification if io is available
              if (io) {
                const [refundNotification] = await conn.query(`
                  SELECT n.*, a.title as auction_title, a.image as auction_image
                  FROM notifications n
                  JOIN auctions a ON n.auction_id = a.id
                  WHERE n.id = ?
                `, [refundNotificationResult.insertId]);
                
                if (refundNotification.length > 0) {
                  sendNotificationToUser(io, bid.user_id, refundNotification[0]);
                }
              }
              
              console.log(`Refunded $${bid.amount} to user ${bid.username} for auction ${auction.id}`);
            } else {
              console.log(`Refund already processed for user ${bid.username}, auction ${auction.id} - skipping duplicate refund`);
            }
          }
        }
        
        // Create winner chat room - must succeed before transaction commits
        console.log(`🔵 Processing auction ${auction.id} - Creating winner chat room for winner ${winner.username}`);
        const chatRoomId = await this.createWinnerChatRoom(auction, winner, conn);
        console.log(`✅ Successfully created/found chat room ${chatRoomId} for auction ${auction.id}`);

        // Create payment transaction for winner
        await this.createPaymentTransaction(auction, winner, conn);

        // Check if winner notification already exists with FOR UPDATE lock to prevent duplicates
        const [existingWinnerNotification] = await conn.query(`
          SELECT id FROM notifications 
          WHERE user_id = ? AND auction_id = ? AND type = 'auction_won'
          FOR UPDATE
        `, [winner.user_id, auction.id]);

        // Create winner notification only if it doesn't exist
        if (existingWinnerNotification.length === 0) {
          // Create notification within the same transaction
          const [notificationResult] = await conn.query(`
            INSERT INTO notifications (user_id, auction_id, type, title, message)
            VALUES (?, ?, ?, ?, ?)
          `, [winner.user_id, auction.id, 'auction_won', '🎉 You Won an Auction!', 
              `Congratulations! You won the auction "${auction.title}" with a bid of $${Number(winner.amount).toFixed(2)}.`]);

          // Get the created notification for real-time sending
          const [notification] = await conn.query(`
            SELECT n.*, a.title as auction_title, a.image as auction_image
            FROM notifications n
            JOIN auctions a ON n.auction_id = a.id
            WHERE n.id = ?
          `, [notificationResult.insertId]);

          // Send real-time notification if io is available
          if (io && notification.length > 0) {
            sendNotificationToUser(io, winner.user_id, notification[0]);
          }
          
          console.log(`Created winner notification for auction ${auction.id}, user ${winner.user_id}`);
        } else {
          console.log(`Winner notification already exists for auction ${auction.id}, user ${winner.user_id}`);
        }

        // Check if auction ended notification already exists for owner
        const [existingOwnerNotification] = await conn.query(`
          SELECT id FROM notifications 
          WHERE user_id = ? AND auction_id = ? AND type = 'auction_ended'
          FOR UPDATE
        `, [auction.user_id, auction.id]);

        // Notify auction owner that their auction ended only if it doesn't exist
        if (existingOwnerNotification.length === 0) {
          const [ownerNotificationResult] = await conn.query(`
            INSERT INTO notifications (user_id, auction_id, type, title, message)
            VALUES (?, ?, ?, ?, ?)
          `, [auction.user_id, auction.id, 'auction_ended', 'Auction Ended', 
              `Your auction "${auction.title}" has ended. Winner: ${winner.username} with $${Number(winner.amount).toFixed(2)}.`]);

          const [ownerNotification] = await conn.query(`
            SELECT n.*, a.title as auction_title, a.image as auction_image
            FROM notifications n
            JOIN auctions a ON n.auction_id = a.id
            WHERE n.id = ?
          `, [ownerNotificationResult.insertId]);

          if (io && ownerNotification.length > 0) {
            sendNotificationToUser(io, auction.user_id, ownerNotification[0]);
          }
        }

        console.log(`Auction ${auction.id} ended. Winner: ${winner.username}`);
      } else {
        // No bids - check if notification already exists, then notify auction owner
        const [existingNoBidsNotification] = await conn.query(`
          SELECT id FROM notifications 
          WHERE user_id = ? AND auction_id = ? AND type = 'auction_ended'
          FOR UPDATE
        `, [auction.user_id, auction.id]);

        if (existingNoBidsNotification.length === 0) {
          const [noBidsNotificationResult] = await conn.query(`
            INSERT INTO notifications (user_id, auction_id, type, title, message)
            VALUES (?, ?, ?, ?, ?)
          `, [auction.user_id, auction.id, 'auction_ended', 'Auction Ended - No Bids', 
              `Your auction "${auction.title}" has ended with no bids.`]);

          const [noBidsNotification] = await conn.query(`
            SELECT n.*, a.title as auction_title, a.image as auction_image
            FROM notifications n
            JOIN auctions a ON n.auction_id = a.id
            WHERE n.id = ?
          `, [noBidsNotificationResult.insertId]);

          if (io && noBidsNotification.length > 0) {
            sendNotificationToUser(io, auction.user_id, noBidsNotification[0]);
          }
        }

        console.log(`Auction ${auction.id} ended with no bids`);
      }
      
      // Handle case where sealed auction has no bids - no refunds needed
      if (auction.bid_type === 'sealed' && allBids.length === 0) {
        console.log(`Sealed auction ${auction.id} ended with no bids - no refunds needed`);
      }
      
      await conn.commit();
      console.log(`[processAuctionEnd] ✅ Successfully processed auction ${auction.id}`);
    } catch (error) {
      await conn.rollback();
      console.error(`[processAuctionEnd] ❌ Error processing auction end for auction ${auction.id}:`, error);
      console.error(`[processAuctionEnd] Error details:`, {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sql: error.sql
      });
    } finally {
      conn.release();
    }
  }

  static async createNotification({ userId, auctionId, type, title, message }, io = null) {
    const pool = await getPool();
    
    try {
      const [result] = await pool.query(`
        INSERT INTO notifications (user_id, auction_id, type, title, message)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, auctionId, type, title, message]);

      // Get the created notification with auction details
      const [notification] = await pool.query(`
        SELECT n.*, a.title as auction_title, a.image as auction_image
        FROM notifications n
        JOIN auctions a ON n.auction_id = a.id
        WHERE n.id = ?
      `, [result.insertId]);

      // Send real-time notification if io is available
      if (io && notification.length > 0) {
        console.log(`📨 Sending notification to user ${userId}:`, {
          type: notification[0].type,
          title: notification[0].title,
          auctionId: notification[0].auction_id
        });
        sendNotificationToUser(io, userId, notification[0]);
      } else {
        if (!io) {
          console.warn(`⚠️ Cannot send notification to user ${userId}: io instance not available`);
        }
        if (!notification || notification.length === 0) {
          console.warn(`⚠️ Cannot send notification to user ${userId}: notification not found`);
        }
      }

      return notification[0];
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async getUserNotifications(userId, limit = 50) {
    const pool = await getPool();
    
    try {
      const [notifications] = await pool.query(`
        SELECT n.*, a.title as auction_title, a.image as auction_image
        FROM notifications n
        JOIN auctions a ON n.auction_id = a.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ?
      `, [userId, limit]);
      
      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    const pool = await getPool();
    
    try {
      await pool.query(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ? AND user_id = ?
      `, [notificationId, userId]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllNotificationsAsRead(userId) {
    const pool = await getPool();
    
    try {
      await pool.query(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  static async getUnreadCount(userId) {
    const pool = await getPool();
    
    try {
      const [result] = await pool.query(`
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async createWinnerChatRoom(auction, winner, conn) {
    const roomName = `🏆 ${auction.title} - Winner Chat`;
    const roomDescription = `Chat room for auction "${auction.title}" winner: ${winner.username}`;
    
    console.log(`[createWinnerChatRoom] Creating chat room for auction ${auction.id}`);
    console.log(`  - Room name: "${roomName}"`);
    console.log(`  - Created by (seller): ${auction.user_id}`);
    console.log(`  - Winner: ${winner.username} (ID: ${winner.user_id})`);
    
    try {
      // Check if chat room already exists with FOR UPDATE lock to prevent race conditions
      // Check by exact name match and created_by
      const [existingRoom] = await conn.query(`
        SELECT id FROM chat_rooms 
        WHERE name = ? AND created_by = ?
        FOR UPDATE
      `, [roomName, auction.user_id]);
      
      if (existingRoom.length > 0) {
        console.log(`[createWinnerChatRoom] ✅ Chat room already exists for auction ${auction.id}, returning existing room ID ${existingRoom[0].id}`);
        // Try to update auction_id for reliability (ignore errors if column missing)
        try {
          await conn.query(`
            UPDATE chat_rooms 
            SET auction_id = ? 
            WHERE id = ?
          `, [auction.id, existingRoom[0].id]);
        } catch (updateError) {
          console.warn(`[createWinnerChatRoom] Could not update auction_id (non-critical):`, updateError.message);
        }
        return existingRoom[0].id;
      }
      
      // Also check if there's any Winner Chat room for this auction (in case name slightly differs)
      // This handles edge cases where auction title might have special characters
      const [anyWinnerRoom] = await conn.query(`
        SELECT id FROM chat_rooms 
        WHERE name LIKE ? AND created_by = ?
        FOR UPDATE
      `, [`%${auction.title}%Winner Chat%`, auction.user_id]);
      
      if (anyWinnerRoom.length > 0) {
        console.log(`[createWinnerChatRoom] ✅ Found existing Winner Chat room for auction ${auction.id}, returning existing room ID ${anyWinnerRoom[0].id}`);
        try {
          await conn.query(`
            UPDATE chat_rooms 
            SET auction_id = ? 
            WHERE id = ?
          `, [auction.id, anyWinnerRoom[0].id]);
        } catch (updateError) {
          console.warn(`[createWinnerChatRoom] Could not update auction_id for fallback room (non-critical):`, updateError.message);
        }
        return anyWinnerRoom[0].id;
      }
      
      // Create new chat room (prefer inserting with auction_id if column exists)
      console.log(`[createWinnerChatRoom] Creating new chat room...`);
      try {
        const [result] = await conn.query(`
          INSERT INTO chat_rooms (name, description, created_by, auction_id, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [roomName, roomDescription, auction.user_id, auction.id]);
        console.log(`[createWinnerChatRoom] ✅ Created winner chat room for auction ${auction.id}: ${roomName} (ID: ${result.insertId})`);
        return result.insertId;
      } catch (insertError) {
        if (insertError.code === 'ER_BAD_FIELD_ERROR') {
          console.warn(`[createWinnerChatRoom] auction_id column missing, inserting without it...`);
          const [result] = await conn.query(`
            INSERT INTO chat_rooms (name, description, created_by, created_at)
            VALUES (?, ?, ?, NOW())
          `, [roomName, roomDescription, auction.user_id]);
          console.log(`[createWinnerChatRoom] ✅ Created winner chat room (without auction_id) for auction ${auction.id}: ${roomName} (ID: ${result.insertId})`);
          return result.insertId;
        }
        throw insertError;
      }
    } catch (error) {
      console.error(`[createWinnerChatRoom] ❌ Error creating winner chat room for auction ${auction.id}:`, error);
      console.error(`[createWinnerChatRoom] Error details:`, {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sql: error.sql
      });
      
      // If duplicate entry error, try to get existing room
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        console.log(`[createWinnerChatRoom] Duplicate entry error, trying to get existing room...`);
        const [existing] = await conn.query(`
          SELECT id FROM chat_rooms 
          WHERE name = ? AND created_by = ?
        `, [roomName, auction.user_id]);
        
        if (existing.length > 0) {
          console.log(`[createWinnerChatRoom] ✅ Found existing chat room after duplicate error: ${existing[0].id}`);
          try {
            await conn.query(`
              UPDATE chat_rooms 
              SET auction_id = ? 
              WHERE id = ?
            `, [auction.id, existing[0].id]);
          } catch (updateError) {
            console.warn(`[createWinnerChatRoom] Could not update auction_id after duplicate error (non-critical):`, updateError.message);
          }
          return existing[0].id;
        }
      }
      
      throw error;
    }
  }

  static async createPaymentTransaction(auction, winner, conn) {
    try {
      // Check if payment transaction already exists with FOR UPDATE lock to prevent race conditions
      const [existingTransaction] = await conn.query(`
        SELECT id FROM payment_transactions 
        WHERE auction_id = ? AND winner_id = ?
        FOR UPDATE
      `, [auction.id, winner.user_id]);
      
      if (existingTransaction.length > 0) {
        console.log(`Payment transaction already exists for auction ${auction.id}, winner ${winner.user_id}`);
        return existingTransaction[0].id;
      }
      
      // Also check if any payment transaction exists for this auction (regardless of winner)
      // This prevents duplicate transactions in case of race conditions
      const [anyTransaction] = await conn.query(`
        SELECT id FROM payment_transactions 
        WHERE auction_id = ?
        FOR UPDATE
      `, [auction.id]);
      
      if (anyTransaction.length > 0) {
        console.log(`Payment transaction already exists for auction ${auction.id} (different check)`);
        return anyTransaction[0].id;
      }
      
      // Create payment transaction
      const [transactionResult] = await conn.query(`
        INSERT INTO payment_transactions (auction_id, winner_id, seller_id, amount, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', NOW())
      `, [auction.id, winner.user_id, auction.user_id, winner.amount]);
      
      const transactionId = transactionResult.insertId;
      
      // Create escrow record (non-critical - skip if table doesn't exist)
      try {
        await conn.query(`
          INSERT INTO payment_escrow (transaction_id, escrow_amount, seller_amount, platform_fee, held_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [transactionId, winner.amount, winner.amount * 0.95, winner.amount * 0.05]); // 5% platform fee
        console.log(`Created escrow record for transaction ${transactionId}`);
      } catch (escrowError) {
        // If escrow table doesn't exist or other error, log but don't fail
        console.warn(`⚠️ Could not create escrow record (non-critical):`, escrowError.message);
      }
      
      // Note: Payment notification is already created in processAuctionEnd as 'auction_won'
      // No need to create duplicate notification here
      
      console.log(`Created payment transaction for auction ${auction.id}: ${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      // If it's a duplicate key error, try to get the existing transaction
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        const [existing] = await conn.query(`
          SELECT id FROM payment_transactions 
          WHERE auction_id = ? AND winner_id = ?
        `, [auction.id, winner.user_id]);
        if (existing.length > 0) {
          console.log(`Found existing payment transaction after duplicate error: ${existing[0].id}`);
          return existing[0].id;
        }
      }
      throw error;
    }
  }
}
