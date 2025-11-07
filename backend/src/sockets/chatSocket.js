import { getPool } from '../utils/db.js';

export function registerChatSocketHandlers(io, socket) {
  // Join a chat room
  socket.on('joinChatRoom', (roomId) => {
    socket.join(`chat:${roomId}`);
  });

  // Leave a chat room
  socket.on('leaveChatRoom', (roomId) => {
    socket.leave(`chat:${roomId}`);
  });

  // Note: sendMessage socket handler removed to prevent duplicate messages
  // Messages are now handled only through the API endpoint

  // Send an image message (with access control)
  socket.on('sendImageMessage', async ({ roomId, userId, imageUrl }) => {
    const pool = await getPool();
    try {
      // Check room access
      const [roomCheck] = await pool.query('SELECT created_by FROM chat_rooms WHERE id = ?', [roomId]);
      if (!roomCheck.length) {
        socket.emit('chatError', { message: 'Room not found' });
        return;
      }
      
      const [result] = await pool.query(
        'INSERT INTO chat_messages (room_id, user_id, image_url, message_type) VALUES (?, ?, ?, ?)',
        [roomId, userId, imageUrl, 'image']
      );

      const [rows] = await pool.query(`
        SELECT cm.*, u.username, u.role
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.id = ?
      `, [result.insertId]);

      const messageData = rows[0];
      io.to(`chat:${roomId}`).emit('newMessage', messageData);
    } catch (error) {
      socket.emit('chatError', { message: 'Failed to send image' });
    }
  });

  // User typing indicator
  socket.on('typing', ({ roomId, username, isTyping }) => {
    socket.to(`chat:${roomId}`).emit('userTyping', { username, isTyping });
  });

  // Stop typing
  socket.on('stopTyping', (roomId) => {
    // This is handled by the typing timeout in the frontend
  });
}
