import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import { Navigate } from 'react-router-dom';
import { Gavel, Truck, Wallet, Clock } from 'lucide-react';

export default function OrderManagement() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [endedListingsCount, setEndedListingsCount] = useState(0);
  const [shippingData, setShippingData] = useState({
    shipping_address: '',
    shipping_method: 'standard',
    tracking_number: '',
    estimated_delivery: '',
    notes: ''
  });
  const [shippingStatuses, setShippingStatuses] = useState({});
  const [trackingModal, setTrackingModal] = useState({ open: false, transaction: null, auction: null });
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', estimatedDelivery: '', notes: '' });
  const [trackingSubmitting, setTrackingSubmitting] = useState(false);

  const formatCurrency = useCallback((value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }, []);

  const summaryCards = useMemo(() => {
    const now = new Date();
    const activeAuctions = activeListingsCount || auctions.filter((auction) => new Date(auction.end_time) > now).length;
    const endedAuctions = endedListingsCount || auctions.filter((auction) => new Date(auction.end_time) <= now).length;

    const sellerTransactions = transactions.filter((transaction) => transaction.seller_id === user?.id);
    const awaitingPayment = sellerTransactions.filter((transaction) => transaction.status === 'pending').length;
    const awaitingShipment = sellerTransactions.filter((transaction) => transaction.status === 'paid').length;
    const inTransit = sellerTransactions.filter((transaction) => transaction.status === 'shipped').length;
    const completed = sellerTransactions.filter((transaction) => ['delivered', 'completed'].includes(transaction.status)).length;
    const totalRevenue = sellerTransactions
      .filter((transaction) => ['paid', 'shipped', 'delivered', 'completed'].includes(transaction.status))
      .reduce((sum, transaction) => sum + Number(transaction.seller_amount || 0), 0);

    return [
      {
        key: 'active',
        icon: <Gavel className="w-5 h-5 text-gray-500" />,
        label: 'รายการกำลังประมูล',
        value: `${activeAuctions}`,
        caption: `กำลังเปิด ${activeAuctions} • จบแล้ว ${endedAuctions}`
      },
      {
        key: 'awaitingShipment',
        icon: <Clock className="w-5 h-5 text-gray-500" />,
        label: 'รอจัดส่ง',
        value: awaitingShipment,
        caption: awaitingPayment > 0 ? `${awaitingPayment} รายการรอการชำระ` : 'ผู้ซื้อชำระเงินครบแล้ว'
      },
      {
        key: 'inTransit',
        icon: <Truck className="w-5 h-5 text-gray-500" />,
        label: 'กำลังจัดส่ง',
        value: inTransit,
        caption: completed > 0 ? `${completed} รายการส่งถึงปลายทางแล้ว` : 'กรุณาตรวจสอบสถานะพัสดุ'
      },
      {
        key: 'revenue',
        icon: <Wallet className="w-5 h-5 text-gray-500" />,
        label: 'รายรับที่ยืนยันแล้ว',
        value: formatCurrency(totalRevenue),
        caption: 'ยอดรวมตั้งแต่เริ่มขาย'
      }
    ];
  }, [auctions, transactions, user, formatCurrency, activeListingsCount, endedListingsCount]);

  useEffect(() => {
    loadAuctions();
    loadShippingStatuses();
    loadActiveListingsCount();
    loadListingCounts();
  }, []);

  const loadActiveListingsCount = async () => {
    try {
      const { data } = await api.get('/auctions/my-active-count');
      setActiveListingsCount(Number(data.count) || 0);
    } catch (error) {
      // fallback to local calc if endpoint unavailable
      setActiveListingsCount(0);
    }
  };

  const loadListingCounts = async () => {
    try {
      const { data } = await api.get('/auctions/my-listing-counts');
      setActiveListingsCount(Number(data.active) || 0);
      setEndedListingsCount(Number(data.ended) || 0);
    } catch (error) {
      setEndedListingsCount(0);
    }
  };

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
      const { data: transactionList } = await api.get('/payments/transactions');
      setTransactions(transactionList);
      const statuses = {};
      transactionList.forEach(transaction => {
        statuses[transaction.auction_id] = {
          status: transaction.status,
          shipped: transaction.shipped_at !== null,
          tracking_number: transaction.tracking_number,
          shipping_address: transaction.shipping_address,
          shipping_method: transaction.shipping_method,
          recipient_name: transaction.recipient_name,
          recipient_phone: transaction.recipient_phone,
          estimated_delivery: transaction.estimated_delivery,
          notes: transaction.notes
        };
      });
      setShippingStatuses(statuses);
    } catch (error) {
      console.error('Failed to load shipping statuses:', error);
    }
  };

  const handleShipConfirm = async (auction) => {
    try {
      // Prefer cached transactions; fall back to API if not found
      let transaction = transactions.find((t) => t.auction_id === auction.id);

      if (!transaction) {
        const { data: transactionList } = await api.get('/payments/transactions');
        setTransactions(transactionList);
        transaction = transactionList.find((t) => t.auction_id === auction.id);
      }
      
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
      setSelectedTransaction(transaction);
      setShippingData({
        shipping_address: transaction.shipping_address || '',
        shipping_method: transaction.shipping_method || 'standard',
        tracking_number: transaction.tracking_number || '',
        estimated_delivery: transaction.estimated_delivery ? transaction.estimated_delivery.slice(0, 10) : '',
        notes: transaction.notes || ''
      });
      setShowShippingForm(true);
    } catch (error) {
      console.error('Error checking transaction:', error);
      alert('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
    }
  };

  const handleSubmitShipping = async () => {
    try {
      if (!selectedAuction || !selectedTransaction) return;

      await api.post(`/payments/transactions/${selectedTransaction.id}/ship`, shippingData);

      alert('ยืนยันการจัดส่งเรียบร้อย');
      setShowShippingForm(false);
      setSelectedAuction(null);
      setSelectedTransaction(null);
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
          tracking_number: shippingData.tracking_number,
          shipping_address: shippingData.shipping_address,
          shipping_method: shippingData.shipping_method,
          recipient_name: selectedTransaction.recipient_name,
          recipient_phone: selectedTransaction.recipient_phone,
          estimated_delivery: shippingData.estimated_delivery,
          notes: shippingData.notes
        }
      }));
      loadAuctions();
      loadShippingStatuses();
    } catch (error) {
      console.error('Error confirming shipment:', error);
      alert('เกิดข้อผิดพลาดในการยืนยันการจัดส่ง');
    }
  };

  const handleCancelShipping = () => {
    setShowShippingForm(false);
    setSelectedAuction(null);
    setSelectedTransaction(null);
    setShippingData({
      shipping_address: '',
      shipping_method: 'standard',
      tracking_number: '',
      estimated_delivery: '',
      notes: ''
    });
  };

  const openTrackingModal = async (auction) => {
    try {
      let transaction = transactions.find((t) => t.auction_id === auction.id);

      if (!transaction) {
        const { data: transactionList } = await api.get('/payments/transactions');
        setTransactions(transactionList);
        transaction = transactionList.find((t) => t.auction_id === auction.id);
      }

      if (!transaction) {
        alert('ไม่พบข้อมูลการชำระเงินสำหรับรายการนี้');
        return;
      }

      setTrackingForm({
        trackingNumber: transaction.tracking_number || '',
        estimatedDelivery: transaction.estimated_delivery ? transaction.estimated_delivery.slice(0, 10) : '',
        notes: transaction.notes || ''
      });
      setTrackingModal({ open: true, transaction, auction });
    } catch (error) {
      console.error('Error opening tracking modal:', error);
      alert('ไม่สามารถเปิดหน้ากรอกหมายเลขพัสดุได้');
    }
  };

  const closeTrackingModal = () => {
    if (trackingSubmitting) return;
    setTrackingModal({ open: false, transaction: null, auction: null });
    setTrackingForm({ trackingNumber: '', estimatedDelivery: '', notes: '' });
  };

  const handleTrackingChange = (field, value) => {
    setTrackingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTrackingSubmit = async (event) => {
    event.preventDefault();
    if (!trackingModal.transaction) return;

    if (!trackingForm.trackingNumber || trackingForm.trackingNumber.trim().length < 4) {
      alert('กรุณากรอกหมายเลขพัสดุอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setTrackingSubmitting(true);
    try {
      await api.post(`/payments/transactions/${trackingModal.transaction.id}/tracking`, {
        trackingNumber: trackingForm.trackingNumber.trim(),
        estimatedDelivery: trackingForm.estimatedDelivery || null,
        shippingNote: trackingForm.notes || null
      });

      alert('บันทึกหมายเลขพัสดุเรียบร้อย');
      closeTrackingModal();
      loadShippingStatuses();
    } catch (error) {
      console.error('Error saving tracking info:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกหมายเลขพัสดุ');
    } finally {
      setTrackingSubmitting(false);
    }
  };

  const handleCheckBuyerStatus = async (auctionId) => {
    try {
      let transaction = transactions.find((t) => t.auction_id === auctionId);

      if (!transaction) {
        const { data: transactionList } = await api.get('/payments/transactions');
        setTransactions(transactionList);
        transaction = transactionList.find((t) => t.auction_id === auctionId);
      }
      
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
              <h1 className="page-title">จัดการคำสั่งซื้อ</h1>
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
            <h1 className="page-title">จัดการคำสั่งซื้อ</h1>
            <p className="page-subtitle">จัดการการประมูลและคำสั่งซื้อของคุณ</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container order-dashboard">
          {error && (
            <div className="alert alert-warning order-alert">
              {error}
            </div>
          )}

          <section className="order-summary-grid">
            {summaryCards.map((card) => (
              <article key={card.key} className="order-summary-card">
                <div className="order-summary-icon">{card.icon}</div>
                <div className="order-summary-content">
                  <span className="order-summary-label">{card.label}</span>
                  <span className="order-summary-value">{card.value}</span>
                  <span className="order-summary-caption">{card.caption}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="order-panel">
            <div className="order-panel__header">
              <div>
                <h2 className="order-panel__title">คำสั่งซื้อของฉัน</h2>
                <p className="order-panel__subtitle">ติดตามสถานะการขายและการจัดส่งของคุณทั้งหมดในที่เดียว</p>
              </div>
              <div className="order-panel__meta">อัปเดตล่าสุด {new Date().toLocaleString('th-TH')}</div>
            </div>

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

            <div className="order-management-content">
              {currentAuctions.length > 0 ? (
                <div className="auctions-grid">
                  {currentAuctions.map((auction) => {
                    const status = getStatusBadge(auction);
                    const shippingStatus = shippingStatuses[auction.id] || {};
                    const paymentStatusMap = {
                      pending: 'รอการชำระเงิน',
                      paid: 'ชำระเงินแล้ว (รอจัดส่ง)',
                      shipped: 'กำลังจัดส่ง',
                      delivered: 'ผู้ซื้อได้รับสินค้าแล้ว',
                      completed: 'คำสั่งซื้อเสร็จสิ้น'
                    };
                    const paymentStatusLabel = paymentStatusMap[shippingStatus.status] || 'ยังไม่มีข้อมูล';
                    const winnerUsername = auction.winner_username || '—';
                    const recipientName = shippingStatus.recipient_name || auction.winner_name || '—';
                    const recipientPhone = shippingStatus.recipient_phone || auction.winner_phone || null;
                    const buyerAddress = shippingStatus.shipping_address || auction.winner_address || null;
                    const hasBuyerAddress = Boolean(buyerAddress);
                    const isDelivered = ['delivered', 'completed'].includes(shippingStatus.status);
                    const isShipped = Boolean(shippingStatus.shipped || ['shipped', 'delivered', 'completed'].includes(shippingStatus.status));
                    const estimatedDelivery = shippingStatus.estimated_delivery
                      ? new Date(shippingStatus.estimated_delivery).toLocaleDateString('th-TH')
                      : null;
 
                    return (
                      <div key={auction.id} className="auction-order-card">
                        <div className="auction-order-header">
                          <div className="auction-order-image">
                            {auction.image ? (
                              <img
                                src={auction.image.startsWith('http') ? auction.image : `${import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000'}${auction.image}`}
                                alt={auction.title}
                              />
                            ) : (
                              <div className="auction-order-placeholder">No Image</div>
                            )}
                          </div>
                          <div className="auction-order-details">
                            <h3 className="auction-order-title">{auction.title}</h3>
                            <div className="auction-order-meta">
                              <span className="auction-order-price">{formatCurrency(auction.current_price)}</span>
                              <span className={`auction-order-status ${status.class}`}>{status.text}</span>
                            </div>
                            <div className="auction-order-meta-info">
                              <span>สิ้นสุด {new Date(auction.end_time).toLocaleString('th-TH')}</span>
                              <span>ผู้ซื้อ: {winnerUsername}</span>
                            </div>
                          </div>
                        </div>

                        <div className="order-detail-grid">
                          <div className="order-detail-item">
                            <span className="detail-label">ราคาเริ่มต้น</span>
                            <span className="detail-value">{formatCurrency(auction.start_price)}</span>
                          </div>
                          <div className="order-detail-item">
                            <span className="detail-label">ราคาชนะ</span>
                            <span className="detail-value">{formatCurrency(auction.winning_amount || auction.current_price)}</span>
                          </div>
                          <div className="order-detail-item">
                            <span className="detail-label">จำนวนผู้เข้าร่วม</span>
                            <span className="detail-value">{auction.bid_count || 0} คน</span>
                          </div>
                          <div className="order-detail-item">
                            <span className="detail-label">สถานะการชำระเงิน</span>
                            <span className="detail-value">{paymentStatusLabel}</span>
                          </div>
                        </div>

                        {hasBuyerAddress ? (
                          <div className={`order-shipping-card ${shippingStatus.shipped ? 'order-shipping-card--shipped' : 'order-shipping-card--pending'}`}>
                            <div className="order-shipping-card__header">
                              <div className="order-shipping-card__title">
                                {shippingStatus.shipped ? 'สถานะการจัดส่ง' : 'ที่อยู่จากผู้ซื้อ'}
                              </div>
                              {shippingStatus.shipped && shippingStatus.tracking_number && (
                                <span className="order-shipping-card__badge">{shippingStatus.tracking_number}</span>
                              )}
                            </div>
                            <div className="order-shipping-card__address whitespace-pre-wrap">
                              {buyerAddress}
                            </div>
                            <div className="order-shipping-card__meta">
                              {recipientName && <span>ผู้รับ: {recipientName}</span>}
                              {recipientPhone && <span>โทร: {recipientPhone}</span>}
                              {shippingStatus.shipping_method && <span>วิธีส่ง: {shippingStatus.shipping_method}</span>}
                              {estimatedDelivery && <span>คาดถึง: {estimatedDelivery}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="order-shipping-card order-shipping-card--empty">
                            <div className="order-shipping-card__header">
                              <div className="order-shipping-card__title">รอข้อมูลที่อยู่จากผู้ซื้อ</div>
                            </div>
                            <div className="order-shipping-card__address">
                              {recipientPhone || buyerAddress
                                ? (
                                  <>
                                    {recipientName && <div>ชื่อผู้รับ: {recipientName}</div>}
                                    {recipientPhone && <div>โทรศัพท์ที่มี: {recipientPhone}</div>}
                                    {buyerAddress && <div>ที่อยู่ที่เคยบันทึก: {buyerAddress}</div>}
                                    <div>แนะนำให้ยืนยันความถูกต้องกับผู้ซื้ออีกครั้งก่อนจัดส่ง</div>
                                  </>
                                )
                                : 'กรุณาติดต่อผู้ซื้อผ่านห้อง Winner Chat เพื่อรับรายละเอียดการจัดส่งก่อนดำเนินการส่งสินค้า'}
                            </div>
                          </div>
                        )}

                        <div className="auction-order-actions">
                          {isDelivered ? (
                            <div className="order-status-chip order-status-chip--delivered">
                              ผู้ซื้อยืนยันการรับสินค้าแล้ว
                            </div>
                          ) : isShipped ? (
                            <button className="btn btn-success btn-sm" type="button" disabled>
                              กำลังจัดส่ง
                            </button>
                          ) : (
                            <button
                              onClick={() => handleShipConfirm(auction)}
                              className="btn btn-success btn-sm"
                              disabled={new Date(auction.end_time) > new Date()}
                              type="button"
                            >
                              ยืนยันการจัดส่ง
                            </button>
                          )}
                          {isShipped && !isDelivered && (
                            <button
                              onClick={() => openTrackingModal(auction)}
                              className="btn btn-secondary btn-sm"
                              type="button"
                            >
                              {shippingStatus.tracking_number ? 'แก้ไขหมายเลขพัสดุ' : 'เพิ่มหมายเลขพัสดุ'}
                            </button>
                          )}
                          <button
                            onClick={() => handleCheckBuyerStatus(auction.id)}
                            className="btn btn-info btn-sm"
                            disabled={new Date(auction.end_time) > new Date()}
                            type="button"
                          >
                            ตรวจสอบสถานะผู้ซื้อ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>ไม่พบการประมูลที่ตรงกับเงื่อนไขที่คุณค้นหา</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showShippingForm && selectedAuction && selectedTransaction && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <div className="dialog-header">
              <h3>ยืนยันการจัดส่งสินค้า</h3>
              <button onClick={handleCancelShipping} className="dialog-close-btn">&times;</button>
            </div>
            <div className="dialog-body">
              {selectedTransaction && (selectedTransaction.recipient_name || selectedTransaction.recipient_phone || selectedTransaction.shipping_address) ? (
                <div className="alert alert-info">
                  <h4 className="text-sm font-semibold mb-2">ข้อมูลผู้รับจากผู้ซื้อ</h4>
                  {selectedTransaction.recipient_name && (
                    <div>ชื่อผู้รับ: {selectedTransaction.recipient_name}</div>
                  )}
                  {selectedTransaction.recipient_phone && (
                    <div>เบอร์โทร: {selectedTransaction.recipient_phone}</div>
                  )}
                  {selectedTransaction.shipping_address && (
                    <div className="mt-2 whitespace-pre-wrap">ที่อยู่: {selectedTransaction.shipping_address}</div>
                  )}
                  {!selectedTransaction.shipping_address && (
                    <div className="mt-2 text-sm text-yellow-100">ผู้ซื้อยังไม่ได้ระบุที่อยู่ กรุณาติดต่อผ่านแชทก่อนจัดส่ง</div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning">
                  ผู้ซื้อยังไม่ได้ส่งข้อมูลที่อยู่ กรุณาติดต่อผ่านแชท winner chat เพื่อขอรายละเอียดก่อนจัดส่ง
                </div>
              )}

              <div className="form-group">
                <label className="form-label">ที่อยู่จัดส่ง *</label>
                <textarea
                  value={shippingData.shipping_address}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipping_address: e.target.value }))}
                  className="form-textarea"
                  rows="3"
                  placeholder="ระบุที่อยู่ที่จะจัดส่งสินค้า"
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">วิธีการจัดส่ง *</label>
                <select
                  value={shippingData.shipping_method}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipping_method: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="standard">การจัดส่งมาตรฐาน</option>
                  <option value="express">การจัดส่งด่วน</option>
                  <option value="pickup">การรับสินค้าตรงที่</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">เลขพัสดุ (ถ้ามี)</label>
                <input
                  type="text"
                  value={shippingData.tracking_number}
                  onChange={(e) => setShippingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  className="form-input"
                  placeholder="ระบุเลขพัสดุหรือรหัสการจัดส่ง"
                />
              </div>
              <div className="form-group">
                <label className="form-label">การคาดการณ์การจัดส่ง</label>
                <input
                  type="date"
                  value={shippingData.estimated_delivery}
                  onChange={(e) => setShippingData(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">หมายเหตุ (ถ้ามี)</label>
                <textarea
                  value={shippingData.notes}
                  onChange={(e) => setShippingData(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-textarea"
                  rows="2"
                  placeholder="เพิ่มข้อมูลหรือคำแนะนำเพิ่มเติม"
                ></textarea>
              </div>
            </div>
            <div className="dialog-footer">
              <button onClick={handleCancelShipping} className="btn btn-secondary">ยกเลิก</button>
              <button onClick={handleSubmitShipping} className="btn btn-primary">ยืนยันการจัดส่ง</button>
            </div>
          </div>
        </div>
      )}

      {trackingModal.open && trackingModal.transaction && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <div className="dialog-header">
              <h3>บันทึกหมายเลขพัสดุ</h3>
              <button onClick={closeTrackingModal} className="dialog-close-btn" type="button">
                &times;
              </button>
            </div>
            <form onSubmit={handleTrackingSubmit} className="dialog-body">
              <div className="form-group">
                <label className="form-label">หมายเลขพัสดุ *</label>
                <input
                  type="text"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => handleTrackingChange('trackingNumber', e.target.value)}
                  className="form-input"
                  placeholder="เช่น TH1234567890"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">วันที่คาดว่าจะถึง (ถ้ามี)</label>
                <input
                  type="date"
                  value={trackingForm.estimatedDelivery}
                  onChange={(e) => handleTrackingChange('estimatedDelivery', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows="3"
                  value={trackingForm.notes}
                  onChange={(e) => handleTrackingChange('notes', e.target.value)}
                  className="form-textarea"
                  placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับการจัดส่งหรือคำแนะนำสำหรับผู้ซื้อ"
                />
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={closeTrackingModal} disabled={trackingSubmitting}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={trackingSubmitting}>
                  {trackingSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเลขพัสดุ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}