import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';
import io from 'socket.io-client';
import {
  Home as HomeIcon,
  Search,
  Plus,
  MessageCircle,
  Bell,
  Wallet,
  CreditCard,
  Package,
  History,
  LogOut,
  ArrowRightLeft
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [balance, setBalance] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
      // Many notifications come with balance changes (refunds/topups/withdrawals/etc.)
      loadBalance();
    });

    // Load initial unread count
    loadUnreadCount();
    loadBalance();
    
    // Check if user is a seller
    checkIfSeller();

    return () => {
      newSocket.emit('leaveNotifications', user.id);
      newSocket.disconnect();
    };
  }, [user]);

  // Keep navbar badge in sync when notifications page marks read
  useEffect(() => {
    const handler = (e) => {
      const next = typeof e?.detail === 'number' ? e.detail : null;
      if (next === null) {
        loadUnreadCount();
        return;
      }
      setUnreadCount(next);
    };
    window.addEventListener('notificationsUnreadUpdated', handler);
    return () => window.removeEventListener('notificationsUnreadUpdated', handler);
  }, [user]);

  // Keep navbar balance in sync with app-level balance updates
  useEffect(() => {
    const handler = (e) => {
      const next = typeof e?.detail === 'number' ? e.detail : null;
      if (next === null) {
        loadBalance();
        return;
      }
      setBalance(Number(next) || 0);
    };
    window.addEventListener('balanceUpdated', handler);
    return () => window.removeEventListener('balanceUpdated', handler);
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

  const loadBalance = async () => {
    try {
      const { data } = await api.get('/users/me');
      setBalance(Number(data.balance) || 0);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
      return;
    }
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);
  
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Modern Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Package size={18} />
          </div>
          <div className="brand-title">AuctionHub</div>
        </Link>

        {/* Modern Navigation Links */}
        <div className="nav-links">
          {/* Main navigation - left side, next to logo */}
          <div className="nav-links-left">
            <Link to="/" className="nav-link">
              <HomeIcon size={16} className="nav-icon" />
              <span className="nav-text">หน้าหลัก</span>
            </Link>
            <Link to="/auctions" className="nav-link">
              <Search size={16} className="nav-icon" />
              <span className="nav-text">เรียกดูการประมูล</span>
            </Link>
            {user && user.role !== 'admin' && (
              <Link to="/add" className="nav-link">
                <Plus size={16} className="nav-icon" />
                <span className="nav-text">สร้างการประมูล</span>
              </Link>
            )}
          </div>

          {user ? (
            <>
              {/* Personal / right-side navigation */}
              <div className="nav-links-right">
                {user && user.role !== 'admin' && (
                  <Link to="/chat" className="nav-link">
                    <MessageCircle size={16} className="nav-icon" />
                    <span className="nav-text">แชท</span>
                  </Link>
                )}
                <Link to="/notifications" className="nav-link relative">
                  <Bell size={16} className="nav-icon" />
                  <span className="nav-text">การแจ้งเตือน</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>
                {user.role !== 'admin' && (
                  <Link to="/orders" className="nav-link">
                    <Package size={16} className="nav-icon" />
                    <span className="nav-text">จัดการคำสั่งซื้อ</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="nav-link">
                    <ArrowRightLeft size={16} className="nav-icon" />
                    <span className="nav-text">Admin</span>
                  </Link>
                )}
              </div>

              {/* User Profile + Dropdown */}
              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="user-info user-menu__button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <div className="user-avatar">
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.username}</span>
                    <span className={`user-role-badge ${user.role === 'admin' ? 'is-admin' : 'is-user'}`}>
                      {user.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </button>

                {menuOpen && (
                  <div className="user-menu__panel">
                    <div className="user-menu__section user-menu__section--header">
                      <div className="user-menu__name">{user.username}</div>
                      <div className={`user-role-badge ${user.role === 'admin' ? 'is-admin' : 'is-user'}`}>
                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                      </div>
                      <div className="user-menu__balance">
                        <span className="label">ยอดเงินรวม</span>
                        <span className="value">
                          {balance !== null ? `฿${balance.toFixed(2)}` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="user-menu__section">
                      <button
                        type="button"
                        className="user-menu__item"
                        onClick={() => {
                          navigate('/payments');
                          setMenuOpen(false);
                        }}
                      >
                        <Wallet size={16} />
                        <span>การชำระเงิน (Payments)</span>
                      </button>
                      <button
                        type="button"
                        className="user-menu__item"
                        onClick={() => {
                          navigate('/top-up');
                          setMenuOpen(false);
                        }}
                        disabled={user.role === 'admin'}
                      >
                        <CreditCard size={16} />
                        <span>เติมเงิน (Top Up)</span>
                      </button>
                      <button
                        type="button"
                        className="user-menu__item"
                        onClick={() => {
                          navigate('/withdraw');
                          setMenuOpen(false);
                        }}
                        disabled={user.role === 'admin'}
                      >
                        <ArrowRightLeft size={16} />
                        <span>ถอนเงิน (Withdraw)</span>
                      </button>
                      <button
                        type="button"
                        className="user-menu__item"
                        onClick={() => {
                          navigate('/auction-history');
                          setMenuOpen(false);
                        }}
                        disabled={user.role === 'admin'}
                      >
                        <History size={16} />
                        <span>ประวัติการประมูล</span>
                      </button>
                    </div>

                    <div className="user-menu__section user-menu__section--footer">
                      <button
                        type="button"
                        className="user-menu__logout"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-actions-wrapper">
              <div className="auth-actions">
                <Link to="/login" className="btn btn-secondary">
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <span>Register</span>
                </Link>
              </div>
            </div>
          )}
          
        </div>

        
      </div>
    </nav>
  );
}