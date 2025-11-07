import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [deductAmounts, setDeductAmounts] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // Debug state changes
  useEffect(() => {
    console.log('=== CONFIRM DIALOG STATE CHANGE ===');
    console.log('confirmDialog state changed:', confirmDialog);
    console.log('confirmDialog type:', typeof confirmDialog);
    console.log('confirmDialog is null:', confirmDialog === null);
    console.log('confirmDialog isOpen:', confirmDialog?.isOpen);
    console.log('confirmDialog action:', confirmDialog?.action);
    console.log('confirmDialog userId:', confirmDialog?.userId);
    console.log('confirmDialog amount:', confirmDialog?.amount);
    console.log('confirmDialog username:', confirmDialog?.username);
    console.log('Full confirmDialog object:', JSON.stringify(confirmDialog, null, 2));
    
    if (confirmDialog) {
      console.log('✅ Confirm dialog is now open!');
      console.log('Action:', confirmDialog.action);
      console.log('User ID:', confirmDialog.userId);
      console.log('Amount:', confirmDialog.amount);
      console.log('Username:', confirmDialog.username);
    } else {
      console.log('❌ Confirm dialog is closed');
    }
  }, [confirmDialog]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Auction management states
  const [auctionSearchTerm, setAuctionSearchTerm] = useState('');
  const [auctionFilter, setAuctionFilter] = useState('all'); // all, active, ended
  const [auctionSortBy, setAuctionSortBy] = useState('newest'); // newest, oldest, price_high, price_low
  const [auctionCurrentPage, setAuctionCurrentPage] = useState(1);
  const auctionsPerPage = 12;

  async function load() {
    try {
      console.log('Loading admin data...');
      setLoading(true);
      const [u, a] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/auctions')
      ]);
      console.log('Users loaded:', u.data);
      console.log('Auctions loaded:', a.data);
      setUsers(u.data); 
      setAuctions(a.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  }

  const showConfirmDialog = (action, userId, amount, username) => {
    console.log('=== SHOW CONFIRM DIALOG ===');
    console.log('Action:', action);
    console.log('User ID:', userId);
    console.log('Amount:', amount);
    console.log('Username:', username);
    console.log('Amount type:', typeof amount);
    console.log('Amount valid:', amount && Number(amount) > 0);
    
    const dialogData = {
      action,
      userId,
      amount,
      username,
      isOpen: true
    };
    
    console.log('Setting confirmDialog to:', dialogData);
    console.log('Before setState - confirmDialog:', confirmDialog);
    
    setConfirmDialog(dialogData);
    
    console.log('After setState call - confirmDialog:', confirmDialog);
    
    // Force a re-render check
    setTimeout(() => {
      console.log('Confirm dialog state after setState (100ms later):', confirmDialog);
    }, 100);
  };

  const hideConfirmDialog = () => {
    setConfirmDialog(null);
  };

  const handleAddFunds = async (userId, amount) => {
    try {
      setLoading(true);
      console.log('=== ADD FUNDS DEBUG ===');
      console.log('Adding funds:', { userId, amount });
      console.log('Amount type:', typeof amount);
      console.log('Amount value:', amount);
      
      // Validate amount
      if (!amount || amount <= 0) {
        console.log('Invalid amount validation failed');
        alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
        return;
      }
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
      }
      
      console.log('Token found:', token.substring(0, 20) + '...');
      console.log('Making API request to:', `/admin/users/${userId}/add-funds`);
      console.log('Request payload:', { amount: Number(amount) });
      
      const response = await api.post(`/admin/users/${userId}/add-funds`, { amount: Number(amount) });
      console.log('=== API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);
      
      if (response.data.success) {
        console.log('Success! Updating UI...');
        setAmounts({ ...amounts, [userId]: '' });
        await load();
        hideConfirmDialog();
        
        // Show success message
        alert(response.data.message || 'เติมเงินสำเร็จ');
      } else {
        console.log('API returned success: false');
        alert('การเติมเงินล้มเหลว');
      }
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Failed to add funds:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'ไม่สามารถเติมเงินได้ กรุณาลองใหม่';
      
      if (error.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (error.response?.status === 403) {
        errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeductFunds = async (userId, amount) => {
    try {
      setLoading(true);
      console.log('Deducting funds:', { userId, amount });
      
      // Validate amount
      if (!amount || amount <= 0) {
        alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
        return;
      }
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
      }
      
      console.log('Making API request to:', `/admin/users/${userId}/deduct-funds`);
      console.log('Request payload:', { amount: Number(amount) });
      
      const response = await api.post(`/admin/users/${userId}/deduct-funds`, { amount: Number(amount) });
      console.log('Deduct funds response:', response.data);
      
      setDeductAmounts({ ...deductAmounts, [userId]: '' });
      await load();
      hideConfirmDialog();
      
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Failed to deduct funds:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'ไม่สามารถหักเงินได้ กรุณาลองใหม่';
      
      if (error.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (error.response?.status === 403) {
        errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log('=== HANDLE CONFIRM DEBUG ===');
    console.log('Handle confirm called:', confirmDialog);
    console.log('Action:', confirmDialog?.action);
    console.log('UserId:', confirmDialog?.userId);
    console.log('Amount:', confirmDialog?.amount);
    console.log('Amount type:', typeof confirmDialog?.amount);
    
    if (confirmDialog.action === 'add') {
      console.log('Calling handleAddFunds...');
      handleAddFunds(confirmDialog.userId, confirmDialog.amount);
    } else if (confirmDialog.action === 'deduct') {
      console.log('Calling handleDeductFunds...');
      handleDeductFunds(confirmDialog.userId, confirmDialog.amount);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Auction filtering and sorting
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(auctionSearchTerm.toLowerCase());
    const matchesFilter = auctionFilter === 'all' || 
      (auctionFilter === 'active' && new Date(auction.end_time) > new Date()) ||
      (auctionFilter === 'ended' && new Date(auction.end_time) <= new Date());
    return matchesSearch && matchesFilter;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (auctionSortBy) {
      case 'newest':
        return new Date(b.end_time) - new Date(a.end_time);
      case 'oldest':
        return new Date(a.end_time) - new Date(b.end_time);
      case 'price_high':
        return Number(b.current_price) - Number(a.current_price);
      case 'price_low':
        return Number(a.current_price) - Number(b.current_price);
      default:
        return 0;
    }
  });

  const totalAuctionPages = Math.ceil(sortedAuctions.length / auctionsPerPage);
  const currentAuctions = sortedAuctions.slice(
    (auctionCurrentPage - 1) * auctionsPerPage,
    auctionCurrentPage * auctionsPerPage
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset auction page when filters change
  useEffect(() => {
    setAuctionCurrentPage(1);
  }, [auctionSearchTerm, auctionFilter, auctionSortBy]);

  useEffect(() => {
    console.log('AdminDashboard mounted, loading data...');
    load();
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading admin dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">⚙️ แดชบอร์ดแอดมิน</h1>
              <p className="page-subtitle">จัดการผู้ใช้ การประมูล และการตั้งค่าระบบ</p>
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="container">
            {/* Statistics Cards */}
            <div className="admin-stats-grid mb-8">
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-info">
                    <div className="admin-stat-number">{users.length}</div>
                    <div className="admin-stat-label">ผู้ใช้ทั้งหมด</div>
                  </div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon">🏆</div>
                  <div className="admin-stat-info">
                    <div className="admin-stat-number">{auctions.length}</div>
                    <div className="admin-stat-label">การประมูลทั้งหมด</div>
                  </div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon">💰</div>
                  <div className="admin-stat-info">
                    <div className="admin-stat-number">
                      ฿{users.reduce((sum, user) => sum + Number(user.balance || 0), 0).toFixed(2)}
                    </div>
                    <div className="admin-stat-label">ยอดเงินรวม</div>
                  </div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon">🔥</div>
                  <div className="admin-stat-info">
                    <div className="admin-stat-number">
                      {auctions.filter(a => new Date(a.end_time) > new Date()).length}
                    </div>
                    <div className="admin-stat-label">การประมูลที่กำลังดำเนิน</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Management */}
            <div className="admin-users-section mb-8">
              <div className="admin-section-header">
                <h2 className="admin-section-title">👥 จัดการผู้ใช้</h2>
                <p className="admin-section-subtitle">จัดการข้อมูลผู้ใช้และยอดเงิน</p>
              </div>
              
              {/* Search Bar - Sticky */}
              <div className="admin-search-sticky">
                <div className="admin-search-container">
                  <div className="admin-search-grid">
                    <div className="admin-search-input">
                      <label htmlFor="userSearch" className="admin-search-label">ค้นหาผู้ใช้</label>
                      <input
                        id="userSearch"
                        type="text"
                        placeholder="ค้นหาตามชื่อผู้ใช้..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="admin-search-stats">
                      <span className="admin-search-text">
                        แสดง {currentUsers.length} จาก {filteredUsers.length} ผู้ใช้
                        {searchTerm && ` (กรองจาก ${users.length} ทั้งหมด)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User List */}
              <div className="admin-users-list">
                {currentUsers.map(user => (
                  <div key={user.id} className="admin-user-card">
                    <div className="admin-user-header">
                      <div className="admin-user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-user-info">
                        <h4 className="admin-user-name">{user.username}</h4>
                        <div className="admin-user-meta">
                          <span className="admin-user-balance">ยอดเงิน: ฿{Number(user.balance || 0).toFixed(2)}</span>
                          <span className="admin-user-role">{user.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="admin-user-actions">
                      <div className="admin-actions-grid">
                        <div className="admin-action-card">
                          <div className="admin-action-header">
                            <div className="admin-action-icon">💰</div>
                            <div className="admin-action-title">เติมเงิน</div>
                          </div>
                          <div className="admin-action-form">
                            <input
                              type="number"
                              placeholder="จำนวนเงิน"
                              value={amounts[user.id] || ''}
                              onChange={(e) => setAmounts({ ...amounts, [user.id]: e.target.value })}
                              className="form-input"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => {
                                console.log('=== ADD FUNDS BUTTON CLICKED ===');
                                console.log('User ID:', user.id);
                                console.log('Amount:', amounts[user.id]);
                                console.log('Username:', user.username);
                                console.log('Amount type:', typeof amounts[user.id]);
                                console.log('Amount valid:', amounts[user.id] && Number(amounts[user.id]) > 0);
                                console.log('Current confirmDialog state:', confirmDialog);
                                
                                if (!amounts[user.id] || Number(amounts[user.id]) <= 0) {
                                  console.log('❌ Invalid amount, showing alert');
                                  alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
                                  return;
                                }
                                
                                console.log('✅ Valid amount, calling showConfirmDialog...');
                                showConfirmDialog('add', user.id, amounts[user.id], user.username);
                                console.log('showConfirmDialog called, check state in next render');
                              }}
                              className="btn btn-success btn-sm"
                              disabled={!amounts[user.id] || Number(amounts[user.id]) <= 0}
                            >
                              เติม
                            </button>
                          </div>
                        </div>
                        <div className="admin-action-card">
                          <div className="admin-action-header">
                            <div className="admin-action-icon">💸</div>
                            <div className="admin-action-title">หักเงิน</div>
                          </div>
                          <div className="admin-action-form">
                            <input
                              type="number"
                              placeholder="จำนวนเงิน"
                              value={deductAmounts[user.id] || ''}
                              onChange={(e) => setDeductAmounts({ ...deductAmounts, [user.id]: e.target.value })}
                              className="form-input"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => {
                                console.log('Deduct funds button clicked:', { 
                                  userId: user.id, 
                                  amount: deductAmounts[user.id], 
                                  username: user.username 
                                });
                                showConfirmDialog('deduct', user.id, deductAmounts[user.id], user.username);
                              }}
                              className="btn btn-warning btn-sm"
                              disabled={!deductAmounts[user.id] || Number(deductAmounts[user.id]) <= 0}
                            >
                              หัก
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-section mt-6">
                  <div className="flex justify-between items-center">
                    <div className="pagination-info">
                      <span className="text-muted text-sm">
                        หน้า {currentPage} จาก {totalPages}
                      </span>
                    </div>
                    <div className="pagination-controls flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-secondary btn-sm"
                      >
                        ก่อนหน้า
                      </button>
                      
                      <div className="pagination-numbers flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                          if (page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary btn-sm"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auctions Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 จัดการการประมูล</h2>
            <p className="text-muted">จัดการการประมูลและดูผู้ชนะ</p>
          </div>
          <div className="card-body">
            {/* Auction Search and Filter Controls */}
            <div className="auction-controls mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label">ค้นหาการประมูล</label>
                  <input
                    type="text"
                    placeholder="ค้นหาตามชื่อการประมูล..."
                    value={auctionSearchTerm}
                    onChange={(e) => setAuctionSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">สถานะ</label>
                  <select
                    value={auctionFilter}
                    onChange={(e) => setAuctionFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="active">กำลังดำเนิน</option>
                    <option value="ended">จบแล้ว</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">เรียงตาม</label>
                  <select
                    value={auctionSortBy}
                    onChange={(e) => setAuctionSortBy(e.target.value)}
                    className="form-select"
                  >
                    <option value="newest">ใหม่ล่าสุด</option>
                    <option value="oldest">เก่าที่สุด</option>
                    <option value="price_high">ราคาสูง</option>
                    <option value="price_low">ราคาต่ำ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Auction Grid */}
            <div className="auction-grid">
              {currentAuctions.map(auction => {
                console.log('Auction data:', auction);
                console.log('Image field:', auction.image);
                console.log('Has image:', auction.image && auction.image.trim() !== '');
                
                // Use same logic as AuctionCard
                const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';
                const imageSrc = (() => {
                  if (!auction.image) return '';
                  if (auction.image.startsWith('http')) return auction.image;
                  // When API returns "/uploads/xyz.jpg", prefix backend origin
                  if (auction.image.startsWith('/')) return `${BACKEND_ORIGIN}${auction.image}`;
                  return `${BACKEND_ORIGIN}/${auction.image}`;
                })();
                
                return (
                <div key={auction.id} className="auction-card">
                  <div className="auction-image">
                    {auction.image ? (
                      <img 
                        src={imageSrc} 
                        alt={auction.title}
                        onError={(e) => {
                          console.log('Image failed to load:', imageSrc);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="auction-no-image"
                      style={{ display: auction.image ? 'none' : 'flex' }}
                    >
                      <div className="no-image-content">
                        <div className="no-image-icon">📷</div>
                        <div className="no-image-text">ไม่มีรูปภาพ</div>
                      </div>
                    </div>
                  </div>
                  <div className="auction-content">
                    <h3 className="auction-title">{auction.title}</h3>
                    
                    {/* Seller Information */}
                    <div className="auction-detail">
                      <span className="detail-label">ผู้ลงสินค้า:</span>
                      <span className="detail-value">{auction.seller_username || 'ไม่ระบุ'}</span>
                    </div>
                    
                    {/* Price Information */}
                    <div className="auction-detail">
                      <span className="detail-label">ราคาเริ่มต้น:</span>
                      <span className="detail-value">฿{Number(auction.start_price).toFixed(2)}</span>
                    </div>
                    
                    <div className="auction-detail">
                      <span className="detail-label">ราคาปัจจุบัน:</span>
                      <span className="detail-value auction-current-price">฿{Number(auction.current_price).toFixed(2)}</span>
                    </div>
                    
                    {/* Time Information */}
                    <div className="auction-detail">
                      <span className="detail-label">เวลาเริ่ม:</span>
                      <span className="detail-value">{new Date(auction.created_at || auction.start_time).toLocaleString('th-TH')}</span>
                    </div>
                    
                    <div className="auction-detail">
                      <span className="detail-label">เวลาสิ้นสุด:</span>
                      <span className="detail-value">{new Date(auction.end_time).toLocaleString('th-TH')}</span>
                    </div>
                    
                    {/* Status */}
                    <div className="auction-detail">
                      <span className="detail-label">สถานะ:</span>
                      <span className={`detail-value status-${auction.status === 'กำลังประมูล' ? 'active' : 'ended'}`}>
                        {auction.status || (new Date(auction.end_time) > new Date() ? 'กำลังประมูล' : 'สิ้นสุดแล้ว')}
                      </span>
                    </div>
                    
                    {/* Winner Information (if ended) */}
                    {auction.winner_username && (
                      <div className="auction-detail winner-info">
                        <span className="detail-label">ผู้ชนะ:</span>
                        <span className="detail-value winner-name">{auction.winner_username}</span>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Auction Pagination */}
            {totalAuctionPages > 1 && (
              <div className="pagination-section mt-6">
                <div className="flex justify-between items-center">
                  <div className="pagination-info">
                    <span className="text-muted text-sm">
                      หน้า {auctionCurrentPage} จาก {totalAuctionPages}
                    </span>
                  </div>
                  <div className="pagination-controls flex gap-2">
                    <button
                      onClick={() => setAuctionCurrentPage(Math.max(1, auctionCurrentPage - 1))}
                      disabled={auctionCurrentPage === 1}
                      className="btn btn-secondary btn-sm"
                    >
                      ก่อนหน้า
                    </button>
                    
                    <div className="pagination-numbers flex gap-1">
                      {Array.from({ length: Math.min(5, totalAuctionPages) }, (_, i) => {
                        const page = auctionCurrentPage <= 3 ? i + 1 : auctionCurrentPage - 2 + i;
                        if (page > totalAuctionPages) return null;
                        return (
                          <button
                            key={page}
                            onClick={() => setAuctionCurrentPage(page)}
                            className={`pagination-btn ${auctionCurrentPage === page ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setAuctionCurrentPage(Math.min(totalAuctionPages, auctionCurrentPage + 1))}
                      disabled={auctionCurrentPage === totalAuctionPages}
                      className="btn btn-secondary btn-sm"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <div className="card-header">
              <h3 className="card-title">
                {confirmDialog.action === 'add' ? '💰 ยืนยันการเติมเงิน' : '⚠️ ยืนยันการหักเงิน'}
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {confirmDialog.action === 'add' ? '💰' : '⚠️'}
                </div>
                <p className="text-lg mb-4">
                  {confirmDialog.action === 'add' 
                    ? `คุณต้องการเติมเงิน ฿${confirmDialog.amount} ให้กับ ${confirmDialog.username} หรือไม่?`
                    : `คุณต้องการหักเงิน ฿${confirmDialog.amount} จาก ${confirmDialog.username} หรือไม่?`
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      console.log('Cancel button clicked');
                      hideConfirmDialog();
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => {
                      console.log('Confirm button clicked');
                      handleConfirm();
                    }}
                    className={`btn ${confirmDialog.action === 'add' ? 'btn-success' : 'btn-danger'}`}
                    disabled={loading}
                  >
                    {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}