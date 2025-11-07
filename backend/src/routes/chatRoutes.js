import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'chat');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

async function hasColumn(pool, tableName, columnName) {
  const [rows] = await pool.query(`
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
  `, [tableName, columnName]);
  return rows.length > 0;
}

// Get chat rooms (private: only user's own rooms + admin can see all + winner chat rooms)
router.get('/rooms', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admins can see all rooms
      query = `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        ORDER BY cr.created_at DESC
      `;
      params = [];
    } else {
      // Users can see their own rooms
      query = `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.created_by = ?
        ORDER BY cr.created_at DESC
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    
    // For non-admin users, also add winner chat rooms
    if (req.user.role !== 'admin') {
      // Get all winner chat rooms
      const [winnerRooms] = await pool.query(`
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.name LIKE '%Winner Chat%'
        ORDER BY cr.created_at DESC
      `);
      
      // Filter winner rooms where user is the winner
      const accessibleWinnerRooms = [];
      for (const room of winnerRooms) {
        // Extract auction title from room name: "🏆 {title} - Winner Chat"
        const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
        if (match) {
          const auctionTitle = match[1];
          
          // Find auction with this title and created_by (seller)
          const [auctions] = await pool.query(`
            SELECT id FROM auctions WHERE title = ? AND user_id = ?
            ORDER BY id DESC
            LIMIT 1
          `, [auctionTitle, room.created_by]);
          
            if (auctions.length > 0) {
              const auction = auctions[0];
              
              // Check if user is seller (created_by) - seller should always have access
              if (room.created_by === req.user.id) {
                accessibleWinnerRooms.push(room);
              } else {
                // Check if user is winner of this auction
                // Method 1: Check from payment_transactions (works for buy-now and regular auctions)
                const [paymentCheck] = await pool.query(`
                  SELECT winner_id FROM payment_transactions 
                  WHERE auction_id = ? AND winner_id = ?
                `, [auction.id, req.user.id]);
                
                // Method 2: Check from bids (for regular auctions)
                const [bidCheck] = await pool.query(`
                  SELECT b.user_id, b.amount
                  FROM bids b
                  WHERE b.auction_id = ?
                  AND b.user_id = ?
                  AND b.amount = (
                    SELECT MAX(amount) FROM bids WHERE auction_id = ?
                  )
                `, [auction.id, req.user.id, auction.id]);
                
                // User is winner if they have payment transaction OR they have highest bid
                if (paymentCheck.length > 0 || bidCheck.length > 0) {
                  accessibleWinnerRooms.push(room);
                }
              }
            }
        }
      }
      
      // Combine user's own rooms with winner rooms
      const allRooms = [...rows, ...accessibleWinnerRooms];
      
      // Remove duplicates
      const uniqueRooms = allRooms.filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      );
      
      res.json(uniqueRooms);
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new chat room
router.post('/rooms', authRequired, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Room name is required' });
  
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO chat_rooms (name, description, created_by) VALUES (?, ?, ?)',
    [name, description, req.user.id]
  );
  
  const [rows] = await pool.query(`
    SELECT cr.*, u.username as created_by_username 
    FROM chat_rooms cr 
    JOIN users u ON cr.created_by = u.id 
    WHERE cr.id = ?
  `, [result.insertId]);
  
  res.json(rows[0]);
});

// Get chat rooms for auction winner (special access for winners)
router.get('/rooms/winner/:auctionId', authRequired, async (req, res) => {
  const { auctionId } = req.params;
  const pool = await getPool();
  
  try {
    let isWinner = false;
    
    // Method 1: Check from payment_transactions (works for buy-now and regular auctions)
    const [paymentCheck] = await pool.query(`
      SELECT winner_id FROM payment_transactions 
      WHERE auction_id = ? AND winner_id = ?
    `, [auctionId, req.user.id]);
    
    if (paymentCheck.length > 0) {
      isWinner = true;
    } else {
      // Method 2: Check from bids (for regular auctions)
      const [bidCheck] = await pool.query(`
        SELECT b.user_id, b.amount, u.username
        FROM bids b
        JOIN users u ON b.user_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1
      `, [auctionId]);
      
      if (bidCheck.length > 0 && bidCheck[0].user_id === req.user.id) {
        isWinner = true;
      }
    }
    
    if (!isWinner) {
      return res.status(403).json({ message: 'Access denied. You are not the winner of this auction.' });
    }
    
    let chatRooms = [];
    const hasAuctionId = await hasColumn(pool, 'chat_rooms', 'auction_id');
    if (hasAuctionId) {
      const [chatRoomsByAuctionId] = await pool.query(`
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.auction_id = ?
        ORDER BY cr.created_at DESC
        LIMIT 1
      `, [auctionId]);
      chatRooms = chatRoomsByAuctionId;
    }
    
    if (chatRooms.length === 0) {
      // Fallback: match by name if auction_id was not stored
      const [auctionRows] = await pool.query('SELECT title, user_id FROM auctions WHERE id = ?', [auctionId]);
      if (!auctionRows.length) {
        return res.status(404).json({ message: 'Auction not found' });
      }
      const auction = auctionRows[0];
      const expectedRoomName = `🏆 ${auction.title} - Winner Chat`;
      const [fallbackRooms] = await pool.query(`
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.name = ? AND cr.created_by = ?
        ORDER BY cr.created_at DESC
        LIMIT 1
      `, [expectedRoomName, auction.user_id]);
      chatRooms = fallbackRooms;
    }
 
    console.log(`✅ User ${req.user.id} accessing winner chat room for auction ${auctionId}: found ${chatRooms.length} room(s)`);
    if (chatRooms.length > 0) {
      console.log(`   Chat room: "${chatRooms[0].name}" (ID: ${chatRooms[0].id})`);
    } else {
      console.warn(`   ⚠️ No chat room found for auction ID: ${auctionId}`);
    }
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error getting winner chat rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all chat rooms accessible to user (including winner chat rooms)
router.get('/rooms/accessible', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admins can see all rooms
      query = `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        ORDER BY cr.created_at DESC
      `;
      params = [];
    } else {
      // Users can see their own rooms + winner chat rooms
      query = `
        SELECT DISTINCT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.created_by = ?
        ORDER BY cr.created_at DESC
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    
      // For non-admin users, also add winner chat rooms
      if (req.user.role !== 'admin') {
        // Get all winner chat rooms (auction_id may be NULL for older rooms)
        const [winnerRooms] = await pool.query(`
          SELECT cr.*, u.username as created_by_username 
          FROM chat_rooms cr 
          JOIN users u ON cr.created_by = u.id 
          WHERE cr.name LIKE '%Winner Chat%'
          ORDER BY cr.created_at DESC
        `);
        
        // Filter winner rooms where user is the winner (or seller)
        const accessibleWinnerRooms = [];
        for (const room of winnerRooms) {
          let auctionId = room.auction_id;
          let auction = null;
          
          if (auctionId) {
            const [auctionRows] = await pool.query(`
              SELECT id, title, user_id FROM auctions WHERE id = ?
            `, [auctionId]);
            if (!auctionRows.length) {
              continue;
            }
            auction = auctionRows[0];
          } else {
            // Fallback: extract auction title from room name
            const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
            if (!match) continue;
            const auctionTitle = match[1];
            const [auctionRows] = await pool.query(`
              SELECT id, title, user_id FROM auctions 
              WHERE title = ? AND user_id = ?
              ORDER BY id DESC
              LIMIT 1
            `, [auctionTitle, room.created_by]);
            if (!auctionRows.length) continue;
            auction = auctionRows[0];
            auctionId = auction.id;
            // Try to persist auction_id for future lookups
            try {
              await pool.query(`
                UPDATE chat_rooms 
                SET auction_id = ? 
                WHERE id = ?
              `, [auctionId, room.id]);
            } catch (updateError) {
              console.warn(`⚠️ Could not backfill auction_id for chat room ${room.id}:`, updateError.message);
            }
          }
          
          if (!auction) continue;
          
          // Seller always has access
          if (room.created_by === req.user.id) {
            accessibleWinnerRooms.push(room);
            continue;
          }
          
          // Check if user is winner of this auction
          const [paymentCheck] = await pool.query(`
            SELECT winner_id FROM payment_transactions 
            WHERE auction_id = ? AND winner_id = ?
          `, [auctionId, req.user.id]);
          
          const [bidCheck] = await pool.query(`
            SELECT b.user_id, b.amount
            FROM bids b
            WHERE b.auction_id = ?
            AND b.user_id = ?
            AND b.amount = (
              SELECT MAX(amount) FROM bids WHERE auction_id = ?
            )
          `, [auctionId, req.user.id, auctionId]);
          
          if (paymentCheck.length > 0 || bidCheck.length > 0) {
            accessibleWinnerRooms.push({ ...room, auction_id: auctionId });
          }
        }
        
        // Combine user's own rooms with winner rooms
        const allRooms = [...rows, ...accessibleWinnerRooms];
        
        // Remove duplicates
        const uniqueRooms = allRooms.filter((room, index, self) => 
          index === self.findIndex(r => r.id === room.id)
        );
        
        res.json(uniqueRooms);
      } else {
        res.json(rows);
      }
  } catch (error) {
    console.error('Error getting accessible chat rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get messages for a room (with access control)
router.get('/rooms/:id/messages', authRequired, async (req, res) => {
  const pool = await getPool();
  
  try {
    // First check if user has access to this room
    const [roomCheck] = await pool.query('SELECT created_by, name FROM chat_rooms WHERE id = ?', [req.params.id]);
    if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });
    
    const room = roomCheck[0];
    let hasAccess = false;
    
    // Admin can access all rooms
    if (req.user.role === 'admin') {
      hasAccess = true;
    }
    // Room creator can access
    else if (room.created_by === req.user.id) {
      hasAccess = true;
    }
    // Check if user is winner of auction (for winner chat rooms)
    else if (room.name.includes('Winner Chat')) {
      // Extract auction title from room name
      const auctionTitle = room.name.replace('🏆 ', '').replace(' - Winner Chat', '');
      
      // Find auction with this title
      const [auctions] = await pool.query(`
        SELECT id FROM auctions WHERE title = ?
      `, [auctionTitle]);
      
      if (auctions.length > 0) {
        const auctionId = auctions[0].id;
        
        // Method 1: Check from payment_transactions (works for buy-now and regular auctions)
        const [paymentCheck] = await pool.query(`
          SELECT winner_id FROM payment_transactions 
          WHERE auction_id = ? AND winner_id = ?
        `, [auctionId, req.user.id]);
        
        // Method 2: Check from bids (for regular auctions)
        const [bidCheck] = await pool.query(`
          SELECT b.user_id
          FROM bids b
          WHERE b.auction_id = ? AND b.user_id = ?
          AND b.amount = (
            SELECT MAX(amount) FROM bids WHERE auction_id = ?
          )
        `, [auctionId, req.user.id, auctionId]);
        
        // User has access if they have payment transaction OR they have highest bid
        if (paymentCheck.length > 0 || bidCheck.length > 0) {
          hasAccess = true;
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [rows] = await pool.query(`
      SELECT cm.*, u.username, u.role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.room_id = ?
      ORDER BY cm.created_at ASC
      LIMIT 100
    `, [req.params.id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a text message (with access control)
router.post('/rooms/:id/messages', authRequired, async (req, res) => {
  const { content, message } = req.body;
  const messageText = content || message;
  if (!messageText?.trim()) return res.status(400).json({ message: 'Message is required' });
  
  const pool = await getPool();
  
  try {
    // Check room access
    const [roomCheck] = await pool.query('SELECT created_by, name FROM chat_rooms WHERE id = ?', [req.params.id]);
    if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });
    
    const room = roomCheck[0];
    let hasAccess = false;
    
    // Admin can access all rooms
    if (req.user.role === 'admin') {
      hasAccess = true;
    }
    // Room creator can access
    else if (room.created_by === req.user.id) {
      hasAccess = true;
    }
    // Check if user is winner of auction (for winner chat rooms)
    else if (room.name.includes('Winner Chat')) {
      // Extract auction title from room name
      const auctionTitle = room.name.replace('🏆 ', '').replace(' - Winner Chat', '');
      
      // Find auction with this title
      const [auctions] = await pool.query(`
        SELECT id FROM auctions WHERE title = ?
      `, [auctionTitle]);
      
      if (auctions.length > 0) {
        const auctionId = auctions[0].id;
        
        // Method 1: Check from payment_transactions (works for buy-now and regular auctions)
        const [paymentCheck] = await pool.query(`
          SELECT winner_id FROM payment_transactions 
          WHERE auction_id = ? AND winner_id = ?
        `, [auctionId, req.user.id]);
        
        // Method 2: Check from bids (for regular auctions)
        const [bidCheck] = await pool.query(`
          SELECT b.user_id
          FROM bids b
          WHERE b.auction_id = ? AND b.user_id = ?
          AND b.amount = (
            SELECT MAX(amount) FROM bids WHERE auction_id = ?
          )
        `, [auctionId, req.user.id, auctionId]);
        
        // User has access if they have payment transaction OR they have highest bid
        if (paymentCheck.length > 0 || bidCheck.length > 0) {
          hasAccess = true;
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO chat_messages (room_id, user_id, message, message_type) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, messageText.trim(), 'text']
    );
    
    const [rows] = await pool.query(`
      SELECT cm.*, u.username, u.role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `, [result.insertId]);
    
    const messageData = rows[0];
    
    // Emit message to socket room
    if (req.app.get('io')) {
      req.app.get('io').to(`chat:${req.params.id}`).emit('newMessage', messageData);
    }
    
    res.json(messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send an image message (with access control)
router.post('/rooms/:id/messages/image', authRequired, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image file is required' });
  
  const pool = await getPool();
  
  // Check room access
  const [roomCheck] = await pool.query('SELECT created_by FROM chat_rooms WHERE id = ?', [req.params.id]);
  if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });
  
  const room = roomCheck[0];
  if (req.user.role !== 'admin' && room.created_by !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const imageUrl = `/uploads/chat/${req.file.filename}`;
  const [result] = await pool.query(
    'INSERT INTO chat_messages (room_id, user_id, image_url, message_type) VALUES (?, ?, ?, ?)',
    [req.params.id, req.user.id, imageUrl, 'image']
  );
  
  const [rows] = await pool.query(`
    SELECT cm.*, u.username, u.role
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.id = ?
  `, [result.insertId]);
  
  res.json(rows[0]);
});

// Delete a message (admin or message owner)
router.delete('/messages/:id', authRequired, async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM chat_messages WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Message not found' });
  
  const message = rows[0];
  if (req.user.role !== 'admin' && message.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  await pool.query('DELETE FROM chat_messages WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
