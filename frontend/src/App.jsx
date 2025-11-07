import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AuctionList from './pages/AuctionList.jsx';
import Home from './pages/Home.jsx';
import AuctionDetail from './pages/AuctionDetail.jsx';
import AddAuction from './pages/AddAuction.jsx';
import Chat from './pages/Chat.jsx';
import Notifications from './pages/Notifications.jsx';
import Payment from './pages/Payment.jsx';
import OrderManagement from './pages/OrderManagement.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminAuctions from './pages/admin/AdminAuctions.jsx';
import AdminTopUps from './pages/admin/AdminTopUps.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import TopUpRequest from './pages/TopUpRequest.jsx';
import { useAuth } from './hooks/useAuth.js';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
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
      {!isAdminRoute && <Navbar />}
      <div className={isAdminRoute ? '' : 'container'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/add" element={user ? <AddAuction /> : <Navigate to="/login" />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
          <Route path="/payments" element={user ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <OrderManagement /> : <Navigate to="/login" />} />
          <Route path="/top-up" element={user ? <TopUpRequest /> : <Navigate to="/login" />} />

          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="auctions" element={<AdminAuctions />} />
            <Route path="top-ups" element={<AdminTopUps />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}


