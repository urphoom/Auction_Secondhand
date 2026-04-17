import { getPool } from '../utils/db.js';

// ตรวจว่ามีคอลัมน์ในตารางหรือไม่ (รองรับ DB เก่าที่ยังไม่มี auction_id ใน chat_rooms)
async function hasColumn(pool, tableName, columnName) {
  const [rows] = await pool.query(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
  `,
    [tableName, columnName]
  );
  return rows.length > 0;
}

// เช็คสิทธิ์เข้าห้อง Winner Chat (ผู้ขาย / ผู้ชนะจาก payment หรือ bid สูงสุด)
async function userHasWinnerChatAccess(pool, room, userId) {
  if (!room || !room.name || !room.name.includes('Winner Chat')) {
    return false;
  }

  let auctionId = room.auction_id;
  let auction = null;

  if (auctionId) {
    const [auctionRows] = await pool.query(
      `
      SELECT id, title, user_id
      FROM auctions
      WHERE id = ?
    `,
      [auctionId]
    );
    if (auctionRows.length > 0) {
      auction = auctionRows[0];
    }
  }

  if (!auction) {
    const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
    if (!match) return false;
    const auctionTitle = match[1];
    const [auctionRows] = await pool.query(
      `
      SELECT id, title, user_id
      FROM auctions
      WHERE title = ? AND user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
      [auctionTitle, room.created_by]
    );
    if (!auctionRows.length) return false;
    auction = auctionRows[0];
    auctionId = auction.id;

    if (!room.auction_id) {
      try {
        await pool.query(
          `
          UPDATE chat_rooms
          SET auction_id = ?
          WHERE id = ?
        `,
          [auctionId, room.id]
        );
      } catch (updateError) {
        console.warn(`⚠️ Could not backfill auction_id for chat room ${room.id}:`, updateError.message);
      }
    }
  }

  if (!auction) return false;

  if (room.created_by === userId) {
    return true;
  }

  const [paymentCheck] = await pool.query(
    `
    SELECT winner_id FROM payment_transactions
    WHERE auction_id = ? AND winner_id = ?
  `,
    [auctionId, userId]
  );

  if (paymentCheck.length > 0) {
    return true;
  }

  const [bidCheck] = await pool.query(
    `
    SELECT b.user_id
    FROM bids b
    WHERE b.auction_id = ? AND b.user_id = ?
      AND b.amount = (
        SELECT MAX(amount)
        FROM bids
        WHERE auction_id = ?
      )
  `,
    [auctionId, userId, auctionId]
  );

  return bidCheck.length > 0;
}

/**
 * chatController
 * - ใช้กับหน้า: แชท / ห้อง Winner Chat หลังประมูล
 * - mount จริงที่: `/api/chat` (`routes/chatRoutes.js` — รูปใช้ multer field `image`)
 */
// GET /api/chat/rooms — รายการห้อง (admin เห็นทั้งหมด; user เห็นของตัวเอง + winner rooms ที่เข้าได้)
export async function listRooms(req, res) {
  const pool = await getPool();

  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        ORDER BY cr.created_at DESC
      `;
      params = [];
    } else {
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

    if (req.user.role !== 'admin') {
      const [winnerRooms] = await pool.query(`
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.name LIKE '%Winner Chat%'
        ORDER BY cr.created_at DESC
      `);

      const accessibleWinnerRooms = [];
      for (const room of winnerRooms) {
        const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
        if (match) {
          const auctionTitle = match[1];

          const [auctions] = await pool.query(
            `
            SELECT id FROM auctions WHERE title = ? AND user_id = ?
            ORDER BY id DESC
            LIMIT 1
          `,
            [auctionTitle, room.created_by]
          );

          if (auctions.length > 0) {
            const auction = auctions[0];

            if (room.created_by === req.user.id) {
              accessibleWinnerRooms.push(room);
            } else {
              const [paymentCheck] = await pool.query(
                `
                  SELECT winner_id FROM payment_transactions 
                  WHERE auction_id = ? AND winner_id = ?
                `,
                [auction.id, req.user.id]
              );

              const [bidCheck] = await pool.query(
                `
                  SELECT b.user_id, b.amount
                  FROM bids b
                  WHERE b.auction_id = ?
                  AND b.user_id = ?
                  AND b.amount = (
                    SELECT MAX(amount) FROM bids WHERE auction_id = ?
                  )
                `,
                [auction.id, req.user.id, auction.id]
              );

              if (paymentCheck.length > 0 || bidCheck.length > 0) {
                accessibleWinnerRooms.push(room);
              }
            }
          }
        }
      }

      const allRooms = [...rows, ...accessibleWinnerRooms];

      const uniqueRooms = allRooms.filter((room, index, self) => index === self.findIndex((r) => r.id === room.id));

      res.json(uniqueRooms);
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// POST /api/chat/rooms — สร้างห้องแชทใหม่
export async function createRoom(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Room name is required' });

  const pool = await getPool();
  const [result] = await pool.query('INSERT INTO chat_rooms (name, description, created_by) VALUES (?, ?, ?)', [
    name,
    description,
    req.user.id
  ]);

  const [rows] = await pool.query(
    `
    SELECT cr.*, u.username as created_by_username 
    FROM chat_rooms cr 
    JOIN users u ON cr.created_by = u.id 
    WHERE cr.id = ?
  `,
    [result.insertId]
  );

  res.json(rows[0]);
}

// GET /api/chat/rooms/winner/:auctionId — ห้องแชทของผู้ชนะประมูล (ต้องเป็นผู้ชนะ)
export async function winnerRooms(req, res) {
  const { auctionId } = req.params;
  const pool = await getPool();

  try {
    let isWinner = false;

    const [paymentCheck] = await pool.query(
      `
      SELECT winner_id FROM payment_transactions 
      WHERE auction_id = ? AND winner_id = ?
    `,
      [auctionId, req.user.id]
    );

    if (paymentCheck.length > 0) {
      isWinner = true;
    } else {
      const [bidCheck] = await pool.query(
        `
        SELECT b.user_id, b.amount, u.username
        FROM bids b
        JOIN users u ON b.user_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1
      `,
        [auctionId]
      );

      if (bidCheck.length > 0 && bidCheck[0].user_id === req.user.id) {
        isWinner = true;
      }
    }

    if (!isWinner) {
      return res.status(403).json({ message: 'Access denied. You are not the winner of this auction.' });
    }

    let chatRooms = [];
    const hasAuctionIdCol = await hasColumn(pool, 'chat_rooms', 'auction_id');
    if (hasAuctionIdCol) {
      const [chatRoomsByAuctionId] = await pool.query(
        `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.auction_id = ?
        ORDER BY cr.created_at DESC
        LIMIT 1
      `,
        [auctionId]
      );
      chatRooms = chatRoomsByAuctionId;
    }

    if (chatRooms.length === 0) {
      const [auctionRows] = await pool.query('SELECT title, user_id FROM auctions WHERE id = ?', [auctionId]);
      if (!auctionRows.length) {
        return res.status(404).json({ message: 'Auction not found' });
      }
      const auction = auctionRows[0];
      const expectedRoomName = `🏆 ${auction.title} - Winner Chat`;
      const [fallbackRooms] = await pool.query(
        `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        WHERE cr.name = ? AND cr.created_by = ?
        ORDER BY cr.created_at DESC
        LIMIT 1
      `,
        [expectedRoomName, auction.user_id]
      );
      chatRooms = fallbackRooms;
    }

    console.log(
      `✅ User ${req.user.id} accessing winner chat room for auction ${auctionId}: found ${chatRooms.length} room(s)`
    );
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
}

// GET /api/chat/rooms/accessible — ห้องที่ user เข้าถึงได้ (รวม winner chat ที่มีสิทธิ์)
export async function accessibleRooms(req, res) {
  const pool = await getPool();

  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT cr.*, u.username as created_by_username 
        FROM chat_rooms cr 
        JOIN users u ON cr.created_by = u.id 
        ORDER BY cr.created_at DESC
      `;
      params = [];
    } else {
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

    if (req.user.role !== 'admin') {
      const [winnerRooms] = await pool.query(`
          SELECT cr.*, u.username as created_by_username 
          FROM chat_rooms cr 
          JOIN users u ON cr.created_by = u.id 
          WHERE cr.name LIKE '%Winner Chat%'
          ORDER BY cr.created_at DESC
        `);

      const accessibleWinnerRooms = [];
      for (const room of winnerRooms) {
        let auctionId = room.auction_id;
        let auction = null;

        if (auctionId) {
          const [auctionRows] = await pool.query(
            `
              SELECT id, title, user_id FROM auctions WHERE id = ?
            `,
            [auctionId]
          );
          if (!auctionRows.length) {
            continue;
          }
          auction = auctionRows[0];
        } else {
          const match = room.name.match(/^🏆\s(.+?)\s-\sWinner Chat$/);
          if (!match) continue;
          const auctionTitle = match[1];
          const [auctionRows] = await pool.query(
            `
              SELECT id, title, user_id FROM auctions 
              WHERE title = ? AND user_id = ?
              ORDER BY id DESC
              LIMIT 1
            `,
            [auctionTitle, room.created_by]
          );
          if (!auctionRows.length) continue;
          auction = auctionRows[0];
          auctionId = auction.id;
          try {
            await pool.query(
              `
                UPDATE chat_rooms 
                SET auction_id = ? 
                WHERE id = ?
              `,
              [auctionId, room.id]
            );
          } catch (updateError) {
            console.warn(`⚠️ Could not backfill auction_id for chat room ${room.id}:`, updateError.message);
          }
        }

        if (!auction) continue;

        if (room.created_by === req.user.id) {
          accessibleWinnerRooms.push(room);
          continue;
        }

        const [paymentCheck] = await pool.query(
          `
            SELECT winner_id FROM payment_transactions 
            WHERE auction_id = ? AND winner_id = ?
          `,
          [auctionId, req.user.id]
        );

        const [bidCheck] = await pool.query(
          `
            SELECT b.user_id, b.amount
            FROM bids b
            WHERE b.auction_id = ?
            AND b.user_id = ?
            AND b.amount = (
              SELECT MAX(amount) FROM bids WHERE auction_id = ?
            )
          `,
          [auctionId, req.user.id, auctionId]
        );

        if (paymentCheck.length > 0 || bidCheck.length > 0) {
          accessibleWinnerRooms.push({ ...room, auction_id: auctionId });
        }
      }

      const allRooms = [...rows, ...accessibleWinnerRooms];

      const uniqueRooms = allRooms.filter((room, index, self) => index === self.findIndex((r) => r.id === room.id));

      res.json(uniqueRooms);
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error('Error getting accessible chat rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /api/chat/rooms/:id/messages — ข้อความในห้อง (เช็คสิทธิ์ก่อน)
export async function getMessages(req, res) {
  const pool = await getPool();

  try {
    const [roomCheck] = await pool.query('SELECT id, created_by, name, auction_id FROM chat_rooms WHERE id = ?', [
      req.params.id
    ]);
    if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });

    const room = roomCheck[0];
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (room.created_by === req.user.id) {
      hasAccess = true;
    } else if (room.name.includes('Winner Chat')) {
      hasAccess = await userHasWinnerChatAccess(pool, room, req.user.id);
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.query(
      `
      SELECT cm.*, u.username, u.role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.room_id = ?
      ORDER BY cm.created_at ASC
      LIMIT 100
    `,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// POST /api/chat/rooms/:id/messages — ส่งข้อความ text (emit socket `newMessage`)
export async function postMessage(req, res) {
  const { content, message } = req.body;
  const messageText = content || message;
  if (!messageText?.trim()) return res.status(400).json({ message: 'Message is required' });

  const pool = await getPool();

  try {
    const [roomCheck] = await pool.query('SELECT id, created_by, name, auction_id FROM chat_rooms WHERE id = ?', [
      req.params.id
    ]);
    if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });

    const room = roomCheck[0];
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (room.created_by === req.user.id) {
      hasAccess = true;
    } else if (room.name.includes('Winner Chat')) {
      hasAccess = await userHasWinnerChatAccess(pool, room, req.user.id);
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [result] = await pool.query(
      'INSERT INTO chat_messages (room_id, user_id, message, message_type) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, messageText.trim(), 'text']
    );

    const [rows] = await pool.query(
      `
      SELECT cm.*, u.username, u.role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `,
      [result.insertId]
    );

    const messageData = rows[0];

    if (req.app.get('io')) {
      req.app.get('io').to(`chat:${req.params.id}`).emit('newMessage', messageData);
    }

    res.json(messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// POST /api/chat/rooms/:id/messages/image — ส่งรูป (multipart `image`)
export async function postImageMessage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    const pool = await getPool();

    const [roomCheck] = await pool.query('SELECT id, created_by, name, auction_id FROM chat_rooms WHERE id = ?', [
      req.params.id
    ]);
    if (!roomCheck.length) return res.status(404).json({ message: 'Room not found' });

    const room = roomCheck[0];
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (room.created_by === req.user.id) {
      hasAccess = true;
    } else if (room.name && room.name.includes('Winner Chat')) {
      hasAccess = await userHasWinnerChatAccess(pool, room, req.user.id);
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const imageUrl = `/uploads/chat/${req.file.filename}`;
    const [result] = await pool.query(
      'INSERT INTO chat_messages (room_id, user_id, image_url, message_type) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, imageUrl, 'image']
    );

    const [rows] = await pool.query(
      `
      SELECT cm.*, u.username, u.role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `,
      [result.insertId]
    );

    const messageData = rows[0];

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${req.params.id}`).emit('newMessage', messageData);
    }

    res.json(messageData);
  } catch (error) {
    console.error('Error sending image message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE /api/chat/messages/:id — ลบข้อความ (เจ้าของข้อความหรือ admin)
export async function deleteMessage(req, res) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM chat_messages WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Message not found' });

  const message = rows[0];
  if (req.user.role !== 'admin' && message.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await pool.query('DELETE FROM chat_messages WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}
