import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

export default function OrderManagement() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [shippingData, setShippingData] = useState({
    shipping_address: '',
    shipping_method: 'standard',
    tracking_number: '',
    estimated_delivery: '',
    notes: ''
  });
  const [shippingStatuses, setShippingStatuses] = useState({});

  useEffect(() => {
    loadAuctions();
    loadShippingStatuses();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auctions/my-auctions');
      setAuctions(data);
    } catch (error) {
      console.error('Failed to load auctions:', error);
      setError('ไม่สามารถโหลดข้อมูลการประมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const loadShippingStatuses = async () => {
    try {
      const { data: transactions } = await api.get('/payments/transactions');
      const statuses = {};
      transactions.forEach(transaction => {
        statuses[transaction.auction_id] = {
          status: transaction.status,
          shipped: transaction.shipped_at !== null,
          tracking_number: transaction.tracking_number
        };
      });
      setShippingStatuses(statuses);
    } catch (error) {
      console.error('Failed to load shipping statuses:', error);
    }
  };

  const handleShipConfirm = async (auction) => {
    try {
      // Find the payment transaction for this auction
      const { data: transactions } = await api.get('/payments/transactions');
      const transaction = transactions.find(t => t.auction_id === auction.id);
      
      if (!transaction) {
        alert('ไม่พบข้อมูลการชำระเงินสำหรับการประมูลนี้');
        return;
      }

      if (transaction.status !== 'paid') {
        alert('ผู้ซื้อยังไม่ได้ชำระเงิน');
        return;
      }

      // Set selected auction and show form
      setSelectedAuction(auction);
      setShowShippingForm(true);
    } catch (error) {
      console.error('Error checking transaction:', error);
      alert('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
    }
  };

  const handleSubmitShipping = async () => {
    try {
      if (!selectedAuction) return;

      // Find the payment transaction for this auction
      const { data: transactions } = await api.get('/payments/transactions');
      const transaction = transactions.find(t => t.auction_id === selectedAuction.id);
      
      if (!transaction) {
        alert('ไม่พบข้อมูลการชำระเงินสำหรับการประมูลนี้');
        return;
      }

      // Call ship API
      await api.post(`/payments/transactions/${transaction.id}/ship`, shippingData);

      alert('ยืนยันการจัดส่งเรียบร้อย');
      setShowShippingForm(false);
      setSelectedAuction(null);
      setShippingData({
        shipping_address: '',
        shipping_method: 'standard',
        tracking_number: '',
        estimated_delivery: '',
        notes: ''
      });
      // Update shipping status
      setShippingStatuses(prev => ({
        ...prev,
        [selectedAuction.id]: {
          status: 'shipped',
          shipped: true,
          tracking_number: shippingData.tracking_number
        }
      }));
      loadAuctions();
    } catch (error) {
      console.error('Error confirming shipment:', error);
      alert('เกิดข้อผิดพลาดในการยืนยันการจัดส่ง');
    }
  };

  const handleCancelShipping = () => {
    setShowShippingForm(false);
    setSelectedAuction(null);
    setShippingData({
      shipping_address: '',
      shipping_method: 'standard',
      tracking_number: '',
      estimated_delivery: '',
      notes: ''
    });
  };

  const handleCheckBuyerStatus = async (auctionId) => {
    try {
      const { data: transactions } = await api.get('/payments/transactions');
      const transaction = transactions.find(t => t.auction_id === auctionId);
      
      if (!transaction) {
        alert('ไม่พบข้อมูลการชำระเงิน');
        return;
      }

      const statusMessages = {
        'pending': 'รอการชำระเงิน',
        'paid': 'ชำระเงินแล้ว',
        'shipped': 'จัดส่งแล้ว',
        'delivered': 'ได้รับสินค้าแล้ว',
        'completed': 'เสร็จสิ้น'
      };

      alert(`สถานะผู้ซื้อ: ${statusMessages[transaction.status] || transaction.status}`);
    } catch (error) {
      console.error('Failed to check buyer status:', error);
      alert('ไม่สามารถตรวจสอบสถานะได้');
    }
  };

  const getStatusBadge = (auction) => {
    const now = new Date();
    const endTime = new Date(auction.end_time);
    
    if (now > endTime) {
      return { text: 'จบแล้ว', class: 'status-ended' };
    } else {
      return { text: 'กำลังประมูล', class: 'status-active' };
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && new Date(auction.end_time) > new Date()) ||
      (filterStatus === 'ended' && new Date(auction.end_time) <= new Date());
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const currentAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">📦 จัดการคำสั่งซื้อ</h1>
              <p className="page-subtitle">จัดการการประมูลของคุณ</p>
            </div>
          </div>
        </div>
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
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">📦 จัดการคำสั่งซื้อ</h1>
            <p className="page-subtitle">จัดการการประมูลและคำสั่งซื้อของคุณ</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Search and Filter */}
          <div className="order-management-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">ค้นหาการประมูล</label>
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อการประมูล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">สถานะ</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">กำลังประมูล</option>
                  <option value="ended">จบแล้ว</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auctions List */}
          <div className="order-management-content">
            {currentAuctions.length > 0 ? (
              <div className="auctions-grid">
                {currentAuctions.map(auction => {
                  const status = getStatusBadge(auction);
                  return (
                    <div key={auction.id} className="auction-order-card">
                      <div className="auction-order-header">
                        <div className="auction-order-image">
                          {auction.image ? (
                            <img 
                              src={auction.image.startsWith('http') ? auction.image : `${import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000'}${auction.image}`}
                              alt={auction.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="auction-no-image" style={{ display: auction.image ? 'none' : 'flex' }}>
                            <div className="no-image-content">
                              <div className="no-image-icon">📷</div>
                              <div className="no-image-text">ไม่มีรูปภาพ</div>
                            </div>
                          </div>
                        </div>
                        <div className="auction-order-info">
                          <h3 className="auction-order-title">{auction.title}</h3>
                          <div className="auction-order-price">฿{Number(auction.current_price).toFixed(2)}</div>
                          <div className={`auction-order-status ${status.class}`}>
                            {status.text}
                          </div>
                        </div>
                      </div>

                      <div className="auction-order-details">
                        <div className="detail-row">
                          <span className="detail-label">ราคาเริ่มต้น:</span>
                          <span className="detail-value">฿{Number(auction.start_price).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">เวลาจบ:</span>
                          <span className="detail-value">
                            {new Date(auction.end_time).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">จำนวนผู้เสนอราคา:</span>
                          <span className="detail-value">{auction.bid_count || 0} คน</span>
                        </div>
                        {auction.winner_username && (
                          <div className="detail-row winner-row">
                            <span className="detail-label">ผู้ชนะ:</span>
                            <span className="detail-value winner-name">{auction.winner_username}</span>
                          </div>
                        )}
                        {auction.winning_amount && (
                          <div className="detail-row">
                            <span className="detail-label">ราคาที่ชนะ:</span>
                            <span className="detail-value winning-amount">฿{Number(auction.winning_amount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="auction-order-actions">
                        {shippingStatuses[auction.id]?.shipped ? (
                          <div className="shipping-status-display">
                            <div className="status-badge shipped">
                              <span className="status-icon">✅</span>
                              <span className="status-text">จัดส่งแล้ว</span>
                            </div>
                            {shippingStatuses[auction.id]?.tracking_number && (
                              <div className="tracking-info">
                                <span className="tracking-label">หมายเลขติดตาม:</span>
                                <span className="tracking-number">{shippingStatuses[auction.id].tracking_number}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleShipConfirm(auction)}
                            className="btn btn-success btn-sm"
                            disabled={new Date(auction.end_time) > new Date()}
                          >
                            🚚 ยืนยันการจัดส่ง
                          </button>
                        )}
                        <button
                          onClick={() => handleCheckBuyerStatus(auction.id)}
                          className="btn btn-info btn-sm"
                          disabled={new Date(auction.end_time) > new Date()}
                        >
                          👁️ ตรวจสอบสถานะผู้ซื้อ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">ไม่มีคำสั่งซื้อ</h3>
                <p className="empty-description">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'ไม่พบการประมูลที่ตรงกับเงื่อนไขการค้นหา'
                    : 'คุณยังไม่มีคำสั่งซื้อที่ต้องจัดการ (เฉพาะการประมูลที่มีผู้ชนะ)'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <div className="pagination-info">
                <span className="text-muted text-sm">
                  หน้า {currentPage} จาก {totalPages}
                </span>
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Form Popup */}
      {showShippingForm && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <div className="dialog-header">
              <h3 className="dialog-title">🚚 ยืนยันการจัดส่ง</h3>
              <p className="dialog-subtitle">
                การประมูล: {selectedAuction?.title}
              </p>
            </div>
            
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">ที่อยู่จัดส่ง *</label>
                <textarea
                  value={shippingData.shipping_address}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipping_address: e.target.value }))}
                  className="form-textarea"
                  placeholder="กรุณาระบุที่อยู่จัดส่งที่ชัดเจน..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">วิธีการจัดส่ง *</label>
                <select
                  value={shippingData.shipping_method}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipping_method: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="standard">จัดส่งธรรมดา (3-5 วัน)</option>
                  <option value="express">จัดส่งด่วน (1-2 วัน)</option>
                  <option value="registered">ลงทะเบียน (3-5 วัน)</option>
                  <option value="ems">EMS (1-2 วัน)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">หมายเลขติดตาม *</label>
                <input
                  type="text"
                  value={shippingData.tracking_number}
                  onChange={(e) => setShippingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  className="form-input"
                  placeholder="เช่น TRK123456789"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">วันที่คาดว่าจะถึง</label>
                <input
                  type="date"
                  value={shippingData.estimated_delivery}
                  onChange={(e) => setShippingData(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">หมายเหตุเพิ่มเติม</label>
                <textarea
                  value={shippingData.notes}
                  onChange={(e) => setShippingData(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-textarea"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
                  rows="2"
                />
              </div>
            </div>

            <div className="dialog-footer">
              <button
                onClick={handleCancelShipping}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmitShipping}
                className="btn btn-primary"
                disabled={!shippingData.shipping_address || !shippingData.tracking_number}
              >
                ✅ ยืนยันการจัดส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
