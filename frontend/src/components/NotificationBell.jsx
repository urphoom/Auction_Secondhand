import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join notifications room
    newSocket.emit('joinNotifications', user.id);

    // Listen for new notifications
    newSocket.on('newNotification', () => {
      setUnreadCount(prev => prev + 1);
    });

    // Load initial unread count
    loadUnreadCount();

    return () => {
      newSocket.emit('leaveNotifications', user.id);
      newSocket.disconnect();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-bell">
      <a href="/notifications" className="bell-link">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </a>
    </div>
  );
}




