import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useEffect, useState } from 'react';
import api from '../services/api.js';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

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
    
    // Check if user is a seller
    checkIfSeller();

    return () => {
      newSocket.emit('leaveNotifications', user.id);
      newSocket.disconnect();
    };
  }, [user]);

  const checkIfSeller = async () => {
    try {
      const { data: myAuctions } = await api.get('/auctions/my-auctions');
      setIsSeller(myAuctions.length > 0);
    } catch (error) {
      console.error('Error checking seller status:', error);
      setIsSeller(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Modern Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">🏆</div>
          <div className="brand-title">AuctionHub</div>
        </Link>

        {/* Modern Navigation Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link to="/auctions" className="nav-link">
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Auctions</span>
          </Link>
          {user && user.role !== 'admin' && (
            <>
              <Link to="/add" className="nav-link">
                <span className="nav-icon">➕</span>
                <span className="nav-text">Sell</span>
              </Link>
              <Link to="/chat" className="nav-link">
                <span className="nav-icon">💬</span>
                <span className="nav-text">Chat</span>
              </Link>
            </>
          )}
          {user ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" className="nav-link relative">
                <span className="nav-icon">🔔</span>
                <span className="nav-text">Notifications</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              
              {/* Payments (hidden for admin only) */}
              {user.role !== 'admin' && (
                <Link to="/top-up" className="nav-link">
                  <span className="nav-icon">💸</span>
                  <span className="nav-text">Top Up</span>
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link to="/payments" className="nav-link">
                  <span className="nav-icon">💳</span>
                  <span className="nav-text">Payments</span>
                </Link>
              )}
              
              {/* Order Management */}
              <Link to="/orders" className="nav-link">
                <span className="nav-icon">📦</span>
                <span className="nav-text">Orders</span>
              </Link>
              
              {/* Admin Panel */}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Admin</span>
                </Link>
              )}
              
              {/* User Profile */}
              <div className="user-info">
                <div className="user-avatar">
                  <span>{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button onClick={logout} className="btn btn-danger">
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="btn btn-secondary">
                <span>👤</span>
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary">
                <span>✨</span>
                <span>Register</span>
              </Link>
            </div>
          )}
          
        </div>

        
      </div>
    </nav>
  );
}