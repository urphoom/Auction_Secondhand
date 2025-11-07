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

  // User typing indicator
  socket.on('typing', ({ roomId, username, isTyping }) => {
    socket.to(`chat:${roomId}`).emit('userTyping', { username, isTyping });
  });

  // Stop typing
  socket.on('stopTyping', (roomId) => {
    // This is handled by the typing timeout in the frontend
  });
}
