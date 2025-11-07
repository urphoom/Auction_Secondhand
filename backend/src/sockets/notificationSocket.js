import { getPool } from '../utils/db.js';

export function registerNotificationSocketHandlers(io, socket) {
  // Join user's notification room
  socket.on('joinNotifications', (userId) => {
    socket.join(`notifications:${userId}`);
  });

  // Leave user's notification room
  socket.on('leaveNotifications', (userId) => {
    socket.leave(`notifications:${userId}`);
  });

  // Send notification to specific user
  socket.on('sendNotification', async ({ userId, notification }) => {
    try {
      io.to(`notifications:${userId}`).emit('newNotification', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });
}

// Helper function to send notification to user
export async function sendNotificationToUser(io, userId, notification) {
  try {
    const roomName = `notifications:${userId}`;
    console.log(`📤 Emitting notification to room: ${roomName}`, {
      userId,
      notificationId: notification.id,
      type: notification.type,
      title: notification.title
    });
    
    io.to(roomName).emit('newNotification', notification);
    
    // Check how many sockets are in the room (for debugging)
    const socketsInRoom = await io.in(roomName).fetchSockets();
    console.log(`📊 Sockets in room ${roomName}: ${socketsInRoom.length}`);
    
    if (socketsInRoom.length === 0) {
      console.warn(`⚠️ No sockets found in room ${roomName} - user may not be connected`);
    }
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
}

