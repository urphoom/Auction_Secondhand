import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join notifications room
    newSocket.emit('joinNotifications', user.id);

    // Listen for new notifications
    newSocket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      newSocket.emit('leaveNotifications', user.id);
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, unreadRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(notificationsRes.data);
      setUnreadCount(unreadRes.data.count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Don't decrease unread count here as we don't know if it was read
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleChatRoomClick = async (notification) => {
    if (notification.type === 'chat_room_created' || notification.type === 'auction_won') {
      try {
        // Get chat room for this auction
        const response = await api.get(`/chat/rooms/winner/${notification.auction_id}`);
        if (response.data.length > 0) {
          // Navigate to chat with the first available room
          navigate(`/chat?room=${response.data[0].id}`);
        } else {
          // If no chat room exists, create one or show message
          alert('Chat room is being created. Please wait a moment and refresh the page.');
        }
      } catch (error) {
        console.error('Error accessing chat room:', error);
        if (error.response?.status === 403) {
          alert('You are not the winner of this auction.');
        } else {
          alert('Error accessing chat room. Please try again.');
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">🔔 Notifications</h1>
              <p className="page-subtitle">Stay updated with auction activities</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Login Required</h3>
                <p className="text-gray mb-4">Please login to view notifications</p>
                <a href="/login" className="btn btn-primary">Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">🔔 Notifications</h1>
              <p className="page-subtitle">Stay updated with auction activities</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-screen">
              <div className="loading">
                <div className="spinner"></div>
                <span>Loading notifications...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">🔔 Notifications</h1>
            <p className="page-subtitle">Stay updated with auction activities</p>
            {unreadCount > 0 && (
              <div className="mt-2">
                <span className="badge badge-warning">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Actions */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Notification Center</h3>
                  <p className="text-gray">
                    {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="btn btn-success btn-sm"
                    >
                      Mark All Read
                    </button>
                  )}
                  <button 
                    onClick={loadNotifications}
                    className="btn btn-secondary btn-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="card">
              <div className="card-body p-0">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${
                      !notification.is_read ? 'bg-gray-800' : 'bg-gray-900'
                    }`}
                  >
                    <div className="notification-icon">
                      {notification.type === 'auction_won' ? '🏆' : 
                       notification.type === 'auction_ended' ? '⏰' : 
                       notification.type === 'bid_placed' ? '💰' : 
                       notification.type === 'bid_refunded' ? '💸' : 
                       notification.type === 'chat_room_created' ? '💬' : '🔔'}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="badge badge-primary ml-2">New</span>
                        )}
                      </div>
                      <div className="notification-text">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {(notification.type === 'chat_room_created' || notification.type === 'auction_won') && (
                        <button 
                          onClick={() => handleChatRoomClick(notification)}
                          className="btn btn-primary btn-sm"
                        >
                          💬 Open Chat
                        </button>
                      )}
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="btn btn-success btn-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                <p className="text-gray mb-4">
                  You don't have any notifications yet. When you participate in auctions, 
                  you'll receive updates here.
                </p>
                <a href="/auctions" className="btn btn-primary">Browse Auctions</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}