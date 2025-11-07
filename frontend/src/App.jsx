import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AuctionList from './pages/AuctionList.jsx';
import Home from './pages/Home.jsx';
import AuctionDetail from './pages/AuctionDetail.jsx';
import AddAuction from './pages/AddAuction.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Chat from './pages/Chat.jsx';
import Notifications from './pages/Notifications.jsx';
import Payment from './pages/Payment.jsx';
import OrderManagement from './pages/OrderManagement.jsx';
import { useAuth } from './hooks/useAuth.js';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="loading">
                <div className="spinner"></div>
                <span>กำลังโหลด...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/add" element={user ? <AddAuction /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
          <Route path="/payments" element={user ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <OrderManagement /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}


