import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import io from 'socket.io-client';
import {
  Bell,
  Clock,
  Gavel,
  MessageCircle,
  Coins,
  Trash2
} from 'lucide-react';

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
      setUnreadCount(prev => {
        const next = Math.max(0, prev - 1);
        window.dispatchEvent(new CustomEvent('notificationsUnreadUpdated', { detail: next }));
        return next;
      });
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
      window.dispatchEvent(new CustomEvent('notificationsUnreadUpdated', { detail: 0 }));
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

  const handleTopUpClick = () => {
    navigate(user?.role === 'admin' ? '/admin/top-ups' : '/top-up');
  };

  const handleWithdrawalClick = () => {
    navigate(user?.role === 'admin' ? '/admin/withdrawals' : '/withdraw');
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
              <h1 className="page-title">การแจ้งเตือน</h1>
              <p className="page-subtitle">ติดตามความเคลื่อนไหวล่าสุดเกี่ยวกับการประมูล</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
              <div className="card">
              <div className="card-body text-center">
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
              <h1 className="page-title">การแจ้งเตือน</h1>
              <p className="page-subtitle">ติดตามความเคลื่อนไหวล่าสุดเกี่ยวกับการประมูล</p>
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
              <h1 className="page-title">การแจ้งเตือน</h1>
            <p className="page-subtitle">ติดตามความเคลื่อนไหวล่าสุดเกี่ยวกับการประมูล</p>
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
                  <h3 className="text-lg font-semibold text-white">ศูนย์การแจ้งเตือน</h3>
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
            <div className="notification-list">
              {notifications.map((notification) => {
                  const isUnread = !notification.is_read;

                  const renderIcon = () => {
                    if (notification.type === 'auction_won' || notification.type === 'auction_ended') {
                      return <Gavel className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
                    }
                    if (notification.type === 'bid_placed' || notification.type === 'bid_refunded') {
                      return <Gavel className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
                    }
                    if (notification.type === 'chat_room_created') {
                      return <MessageCircle className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
                    }
                    if (notification.type?.startsWith('topup_') || notification.type?.startsWith('withdrawal_')) {
                      return <Coins className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
                    }
                    return <Bell className="w-4 h-4 text-gray-400" strokeWidth={1.5} />;
                  };

                  return (
                    <div
                      key={notification.id}
                      className="notification-item flex items-center gap-4 px-4 py-5 border-bottom-line"
                    >
                      <div className="flex items-center mr-1 gap-2">
                        {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                        <div className="notification-icon flex items-center justify-center">
                          {renderIcon()}
                        </div>
                      </div>

                      <div className="notification-content flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="notification-title font-semibold text-gray-900">
                              {notification.title}
                            </div>
                            <div className="notification-text mt-1.5 text-sm text-gray-500">
                              {notification.message}
                            </div>
                            {notification.context && (() => {
                              let contextData;
                              try {
                                contextData = typeof notification.context === 'string'
                                  ? JSON.parse(notification.context)
                                  : notification.context;
                              } catch (e) {
                                contextData = null;
                              }
                              if (contextData && (contextData.amount || contextData.requestId)) {
                                return (
                                  <div className="notification-context mt-1 text-xs text-gray-500">
                                    {contextData.amount !== undefined && (
                                      <div>ยอดเงิน: ฿{Number(contextData.amount).toFixed(2)}</div>
                                    )}
                                    {contextData.requestId !== undefined && (
                                      <div>รหัสคำขอ #{contextData.requestId}</div>
                                    )}
                                    {contextData.note && (
                                      <div>หมายเหตุ: {contextData.note}</div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="notification-time text-xs text-gray-400 whitespace-nowrap flex items-start gap-1">
                            <Clock className="w-3 h-3 mt-0.5" strokeWidth={1.5} />
                            <span>{new Date(notification.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {(notification.type === 'chat_room_created' || notification.type === 'auction_won') && (
                            <button 
                              onClick={() => handleChatRoomClick(notification)}
                              className="btn btn-secondary btn-sm"
                            >
                              Open Chat
                            </button>
                          )}
                          {(notification.type === 'topup_created' || notification.type === 'topup_approved' || notification.type === 'topup_rejected') && (
                            <button
                              onClick={handleTopUpClick}
                              className="btn btn-secondary btn-sm"
                            >
                              ไปยังคำขอเติมเงิน
                            </button>
                          )}
                          {(notification.type === 'withdrawal_created' || notification.type === 'withdrawal_approved' || notification.type === 'withdrawal_rejected') && (
                            <button
                              onClick={handleWithdrawalClick}
                              className="btn btn-secondary btn-sm"
                            >
                              ไปยังคำขอถอนเงิน
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
                            className="btn btn-sm"
                            style={{ padding: '0.25rem', borderRadius: '9999px', background: 'transparent' }}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="card">
              <div className="card-body flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center">
                  <Bell className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">ไม่มีการแจ้งเตือน</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md text-center">
                  เมื่อคุณเข้าร่วมการประมูลหรือมีการอัปเดตสำคัญ ระบบจะแสดงการแจ้งเตือนที่นี่
                </p>
                <a href="/auctions" className="btn btn-secondary btn-sm">ดูการประมูลทั้งหมด</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}