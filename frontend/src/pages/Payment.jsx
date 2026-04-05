import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Wallet, Clock, Truck, CheckCircle2 } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const statusMeta = {
  pending: {
    label: 'รอการชำระเงิน',
    chipClass: 'payment-status-chip payment-status-chip--pending',
    description: 'กรุณาชำระเงินเพื่อให้ผู้ขายเตรียมจัดส่งสินค้า'
  },
  paid: {
    label: 'ชำระเงินแล้ว (รอจัดส่ง)',
    chipClass: 'payment-status-chip payment-status-chip--paid',
    description: 'ผู้ขายจะจัดส่งสินค้าให้คุณในเร็ว ๆ นี้'
  },
  shipped: {
    label: 'กำลังจัดส่ง',
    chipClass: 'payment-status-chip payment-status-chip--shipped',
    description: 'ติดตามหมายเลขพัสดุและกดยืนยันเมื่อได้รับสินค้า'
  },
  delivered: {
    label: 'ได้รับสินค้าแล้ว',
    chipClass: 'payment-status-chip payment-status-chip--delivered',
    description: 'คุณยืนยันการรับสินค้าแล้ว รอระบบโอนเงินให้ผู้ขาย'
  },
  completed: {
    label: 'เสร็จสิ้น',
    chipClass: 'payment-status-chip payment-status-chip--completed',
    description: 'คำสั่งซื้อเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ'
  }
};

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingModal, setShippingModal] = useState({ open: false, transaction: null });
  const [shippingForm, setShippingForm] = useState({ recipientName: '', recipientPhone: '', shippingAddress: '', shippingMethod: 'standard', shippingNote: '' });
  const [shippingErrors, setShippingErrors] = useState({});
  const [shippingSubmitting, setShippingSubmitting] = useState(false);

  const formatCurrency = useCallback((value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }, []);

  const summaryCards = useMemo(() => {
    const pending = transactions.filter((transaction) => transaction.status === 'pending').length;
    const awaitingShipment = transactions.filter((transaction) => transaction.status === 'paid').length;
    const inTransit = transactions.filter((transaction) => transaction.status === 'shipped').length;
    const completed = transactions.filter((transaction) => ['delivered', 'completed'].includes(transaction.status)).length;
    const totalSpent = transactions
      .filter((transaction) => ['paid', 'shipped', 'delivered', 'completed'].includes(transaction.status))
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return [
      {
        key: 'balance',
        icon: <Wallet className="w-5 h-5 text-gray-500" />,
        label: 'ยอดเงินในบัญชี',
        value: formatCurrency(balance),
        caption: 'พร้อมใช้สำหรับประมูลครั้งถัดไป'
      },
      {
        key: 'pending',
        icon: <Clock className="w-5 h-5 text-gray-500" />,
        label: 'รอการชำระ',
        value: pending,
        caption: pending ? 'โปรดชำระเพื่อไม่ให้รายการหมดอายุ' : 'ไม่มีรายการค้างชำระ'
      },
      {
        key: 'shipping',
        icon: <Truck className="w-5 h-5 text-gray-500" />,
        label: 'กำลังจัดส่ง',
        value: awaitingShipment + inTransit,
        caption: `${awaitingShipment} รายการรอผู้ขายส่ง · ${inTransit} รายการกำลังส่ง`
      },
      {
        key: 'completed',
        icon: <CheckCircle2 className="w-5 h-5 text-gray-500" />,
        label: 'รับสินค้าแล้ว',
        value: completed,
        caption: `ยอดใช้จ่ายรวม ${formatCurrency(totalSpent)}`
      }
    ];
  }, [transactions, balance, formatCurrency]);

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get('/payments/transactions');

      const buyerTransactions = data.filter(transaction => transaction.winner_id === user.id);
      setTransactions(buyerTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      alert('Failed to load payment transactions: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadBalance = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/balance');
      const next = Number(data.balance) || 0;
      setBalance(next);
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: next }));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadBalance();
    }
  }, [user, loadTransactions, loadBalance]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL);
    newSocket.emit('joinNotifications', user.id);

    const handleNotification = (notification) => {
      if (!notification) return;
      if (notification.type === 'topup_approved' || notification.type === 'topup_created' || notification.type === 'topup_rejected') {
        loadBalance();
      }
    };

    newSocket.on('newNotification', handleNotification);

    return () => {
      newSocket.off('newNotification', handleNotification);
      newSocket.emit('leaveNotifications', user.id);
      newSocket.disconnect();
    };
  }, [user, loadBalance]);

  // Filter transactions based on search term and status
  useEffect(() => {
    let filtered = transactions;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(transaction => 
        transaction.auction_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.winner_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.seller_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter]);


  const handleCreateTransaction = async (auctionId) => {
    try {
      await api.post('/payments/transactions', { auction_id: auctionId });
      alert('Payment transaction created successfully!');
      loadTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create payment transaction');
    }
  };

  const handlePay = async (transactionId, shippingData) => {
    try {
      const { data } = await api.post(`/payments/transactions/${transactionId}/pay`, shippingData);
      
      alert(`ชำระเงินเรียบร้อยแล้ว!\nผู้ขายได้รับ: ฿${Number(data.seller_amount).toFixed(2)}\nค่าธรรมเนียมแพลตฟอร์ม: ฿${Number(data.platform_fee).toFixed(2)}`);
      await loadTransactions();
      await loadBalance(); // Refresh balance after payment
      return true;
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'ไม่สามารถชำระเงินได้');
      return false;
    }
  };



  const handleDeliver = async (transactionId) => {
    try {
      await api.post(`/payments/transactions/${transactionId}/deliver`);
      alert('ยืนยันการรับสินค้าเรียบร้อยแล้ว! ยอดเงินจะถูกโอนให้ผู้ขาย');
      loadTransactions();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('ไม่สามารถยืนยันการรับสินค้าได้: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleComplete = async (transactionId) => {
    try {
      await api.post(`/payments/transactions/${transactionId}/complete`);
      alert('Transaction completed successfully!');
      loadTransactions();
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('Failed to complete transaction');
    }
  };

  const shippingModalTitle = useMemo(() => {
    if (!shippingModal.transaction) return 'ที่อยู่จัดส่ง';
    return `กรอกที่อยู่สำหรับ "${shippingModal.transaction.auction_title}"`;
  }, [shippingModal.transaction]);

  const openShippingModal = (transaction) => {
    setShippingErrors({});
    setShippingForm({
      recipientName: transaction.recipient_name || user?.username || '',
      recipientPhone: transaction.recipient_phone || '',
      shippingAddress: transaction.shipping_address || '',
      shippingMethod: transaction.shipping_method || 'standard',
      shippingNote: transaction.notes || ''
    });
    setShippingModal({ open: true, transaction });
  };

  const closeShippingModal = () => {
    if (shippingSubmitting) return;
    setShippingModal({ open: false, transaction: null });
  };

  const validateShippingForm = () => {
    const errors = {};
    if (!shippingForm.recipientName || shippingForm.recipientName.trim().length < 2) {
      errors.recipientName = 'กรุณากรอกชื่อผู้รับ';
    }
    const digits = (shippingForm.recipientPhone || '').replace(/[^0-9+]/g, '');
    if (!digits || digits.length < 6) {
      errors.recipientPhone = 'กรุณากรอกเบอร์โทรที่ถูกต้อง';
    }
    if (!shippingForm.shippingAddress || shippingForm.shippingAddress.trim().length < 10) {
      errors.shippingAddress = 'กรุณากรอกที่อยู่สำหรับจัดส่ง';
    }
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingChange = (field, value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleShippingSubmit = async (event) => {
    event.preventDefault();
    if (!shippingModal.transaction) return;
    if (!validateShippingForm()) return;

    setShippingSubmitting(true);
    const success = await handlePay(shippingModal.transaction.id, {
      recipientName: shippingForm.recipientName.trim(),
      recipientPhone: shippingForm.recipientPhone.trim(),
      shippingAddress: shippingForm.shippingAddress.trim(),
      shippingMethod: shippingForm.shippingMethod,
      shippingNote: shippingForm.shippingNote.trim()
    });
    setShippingSubmitting(false);
    if (success) {
      closeShippingModal();
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">การชำระเงินของฉัน</h1>
              <p className="page-subtitle">กำลังโหลดข้อมูลคำสั่งซื้อและยอดเงินของคุณ...</p>
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
            <h1 className="page-title">การชำระเงินของฉัน</h1>
            <p className="page-subtitle">ติดตามสถานะการชำระสินค้าและการจัดส่งทั้งหมดของคุณ</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container order-dashboard">
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

          <section className="order-panel payment-panel">
            <div className="order-panel__header">
              <div>
                <h2 className="order-panel__title">คำสั่งซื้อที่คุณชนะ</h2>
                <p className="order-panel__subtitle">ตรวจสอบยอดค้างชำระและดูรายละเอียดการจัดส่งทุกรายการ</p>
              </div>
              <div className="order-panel__meta">อัปเดตล่าสุด {new Date().toLocaleString('th-TH')}</div>
            </div>

            <div className="order-management-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">ค้นหารายการชำระเงิน</label>
                  <input
                    type="text"
                    placeholder="ค้นหาตามชื่อสินค้า, ผู้ขาย หรือสถานะ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">สถานะ</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="pending">รอการชำระเงิน</option>
                    <option value="paid">ชำระเงินแล้ว</option>
                    <option value="shipped">กำลังจัดส่ง</option>
                    <option value="delivered">ได้รับสินค้าแล้ว</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="order-management-content">
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon" />
                  <h3 className="empty-title">ไม่มีรายการชำระเงิน</h3>
                  <p className="empty-description">คุณยังไม่ชนะการประมูลใด ๆ หรือยังไม่มีรายการที่ต้องชำระ</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3 className="empty-title">ไม่พบรายการที่ค้นหา</h3>
                  <p className="empty-description">ไม่พบรายการที่ตรงกับคำค้นหา "{searchTerm}"</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="btn btn-secondary"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              ) : (
                <div className="payments-grid">
                  {filteredTransactions.map((transaction) => {
                    const statusInfo = statusMeta[transaction.status] || statusMeta.pending;
                    const detailItems = [
                      { label: 'ราคาที่ต้องชำระ', value: formatCurrency(transaction.amount) },
                      { label: 'ผู้ขายได้รับ', value: formatCurrency(transaction.seller_amount || 0) },
                      { label: 'ค่าธรรมเนียมแพลตฟอร์ม', value: formatCurrency(transaction.platform_fee || 0) },
                      { label: 'สถานะการชำระ', value: statusInfo.label }
                    ];
                    if (transaction.paid_at) {
                      detailItems.push({ label: 'ชำระเมื่อ', value: new Date(transaction.paid_at).toLocaleString('th-TH') });
                    }

                    const recipientName = transaction.recipient_name || null;
                    const recipientPhone = transaction.recipient_phone || null;
                    const shippingAddress = transaction.shipping_address || null;
                    const shippingMethod = transaction.shipping_method || null;
                    const estimatedDelivery = transaction.estimated_delivery
                      ? new Date(transaction.estimated_delivery).toLocaleDateString('th-TH')
                      : null;
                    const showShippingInfo = transaction.status !== 'pending';
                    const isDelivered = ['delivered', 'completed'].includes(transaction.status);
                    const isShipped = ['shipped', 'delivered', 'completed'].includes(transaction.status);

                    return (
                      <div key={transaction.id} className="payment-card">
                        <div className="payment-card__header">
                          <div className="payment-card__image">
                            {transaction.auction_image ? (
                              <img
                                src={transaction.auction_image.startsWith('http') ? transaction.auction_image : `${import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000'}${transaction.auction_image}`}
                                alt={transaction.auction_title}
                              />
                            ) : (
                              <div className="auction-order-placeholder">ไม่มีรูปภาพ</div>
                            )}
                          </div>
                          <div className="payment-card__details">
                            <h3 className="payment-card__title">{transaction.auction_title}</h3>
                            <div className="payment-card__meta">
                              <span className="payment-card__price">{formatCurrency(transaction.amount)}</span>
                            </div>
                            <div className="payment-card__meta-info">
                              <span>ชนะเมื่อ {new Date(transaction.created_at).toLocaleString('th-TH')}</span>
                              <span>ผู้ขาย {transaction.seller_username}</span>
                            </div>
                            <p className="payment-card__note">{statusInfo.description}</p>
                          </div>
                        </div>

                        <div className="payment-card__details-row">
                          <div className="order-detail-grid">
                            {detailItems.map((item) => (
                              <div key={item.label} className="order-detail-item">
                                <span className="detail-label">{item.label}</span>
                                <span className="detail-value">{item.value}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="payment-card__status">
                            <span className={statusInfo.chipClass}>
                              {statusInfo.icon} {statusInfo.label}
                            </span>
                            {transaction.paid_at && (
                              <span className="payment-card__paid-at">
                                ชำระเมื่อ {new Date(transaction.paid_at).toLocaleString('th-TH')}
                              </span>
                            )}
                            {transaction.status === 'paid' && (
                              <div className="order-status-chip order-status-chip--pending">
                                ⏳ รอผู้ขายจัดส่งสินค้า
                              </div>
                            )}
                            {isDelivered && (
                              <div className="order-status-chip order-status-chip--delivered">
                                คุณยืนยันการรับสินค้าแล้ว
                              </div>
                            )}
                          </div>
                        </div>

                        {showShippingInfo ? (
                          <div className={`order-shipping-card ${isShipped ? 'order-shipping-card--shipped' : 'order-shipping-card--pending'}`}>
                            <div className="order-shipping-card__header">
                              <div className="order-shipping-card__title">
                                {isShipped ? 'สถานะการจัดส่ง' : 'ที่อยู่สำหรับจัดส่ง'}
                              </div>
                              {transaction.tracking_number && (
                                <span className="order-shipping-card__badge">{transaction.tracking_number}</span>
                              )}
                            </div>
                            {shippingAddress ? (
                              <>
                                <div className="order-shipping-card__address whitespace-pre-wrap">
                                  {shippingAddress}
                                </div>
                                <div className="order-shipping-card__meta">
                                  {recipientName && <span>ผู้รับ: {recipientName}</span>}
                                  {recipientPhone && <span>โทร: {recipientPhone}</span>}
                                  {shippingMethod && <span>วิธีการจัดส่ง: {shippingMethod}</span>}
                                  {estimatedDelivery && <span>คาดถึง: {estimatedDelivery}</span>}
                                </div>
                              </>
                            ) : (
                              <div className="order-shipping-card__address">
                                ผู้ขายจะระบุที่อยู่และหมายเลขพัสดุหลังจากคุณชำระเงินเรียบร้อย
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="order-shipping-card order-shipping-card--empty">
                            <div className="order-shipping-card__header">
                              <div className="order-shipping-card__title">ยังไม่กรอกข้อมูลจัดส่ง</div>
                            </div>
                            <div className="order-shipping-card__address">
                              กรอกชื่อผู้รับ เบอร์โทร และที่อยู่ในขั้นตอนชำระเงิน เพื่อให้ผู้ขายจัดส่งสินค้าได้อย่างถูกต้อง
                            </div>
                          </div>
                        )}

                        <div className="auction-order-actions payment-card__actions">
                          {transaction.status === 'pending' && (
                            <button
                              onClick={() => openShippingModal(transaction)}
                              className="btn btn-primary btn-sm"
                              type="button"
                            >
                              ชำระเงิน
                            </button>
                          )}

                          {transaction.status === 'shipped' && (
                            <button
                              onClick={() => handleDeliver(transaction.id)}
                              className="btn btn-success btn-sm"
                              type="button"
                            >
                              ยืนยันว่าได้รับสินค้าแล้ว
                            </button>
                          )}

                          {transaction.status === 'delivered' && (
                            <button
                              onClick={() => handleComplete(transaction.id)}
                              className="btn btn-bid-primary btn-sm"
                              type="button"
                            >
                              เสร็จสิ้น
                            </button>
                          )}

                          {transaction.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/reviews/new/${transaction.id}`)}
                              className="btn btn-secondary btn-sm"
                              type="button"
                            >
                              ให้คะแนนผู้ขาย
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {filteredTransactions.length > 0 && (
              <div className="pagination-container">
                <span>รวม {filteredTransactions.length} รายการ</span>
              </div>
            )}
          </section>
        </div>
      </div>

      {shippingModal.open && (
        <div className="confirmation-dialog" role="dialog" aria-modal="true">
          <div className="confirmation-dialog-content">
            <div className="dialog-header">
              <h2 className="dialog-title">{shippingModalTitle}</h2>
              <button type="button" className="dialog-close-btn" onClick={closeShippingModal} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleShippingSubmit} className="dialog-body space-y-4">
              <div>
                <label className="form-label">ชื่อผู้รับ *</label>
                <input
                  type="text"
                  value={shippingForm.recipientName}
                  onChange={(e) => handleShippingChange('recipientName', e.target.value)}
                  className={`form-input ${shippingErrors.recipientName ? 'error' : ''}`}
                  placeholder="เช่น ก้องภพ ใจดี"
                  disabled={shippingSubmitting}
                  required
                />
                {shippingErrors.recipientName && <p className="form-error">{shippingErrors.recipientName}</p>}
              </div>

              <div>
                <label className="form-label">เบอร์โทรผู้รับ *</label>
                <input
                  type="tel"
                  value={shippingForm.recipientPhone}
                  onChange={(e) => handleShippingChange('recipientPhone', e.target.value)}
                  className={`form-input ${shippingErrors.recipientPhone ? 'error' : ''}`}
                  placeholder="เช่น 0812345678"
                  disabled={shippingSubmitting}
                  required
                />
                {shippingErrors.recipientPhone && <p className="form-error">{shippingErrors.recipientPhone}</p>}
              </div>

              <div>
                <label className="form-label">ที่อยู่สำหรับจัดส่ง *</label>
                <textarea
                  rows="4"
                  value={shippingForm.shippingAddress}
                  onChange={(e) => handleShippingChange('shippingAddress', e.target.value)}
                  className={`form-textarea ${shippingErrors.shippingAddress ? 'error' : ''}`}
                  placeholder="บ้านเลขที่/หมู่บ้าน/ถนน/ตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์"
                  disabled={shippingSubmitting}
                  required
                />
                {shippingErrors.shippingAddress && <p className="form-error">{shippingErrors.shippingAddress}</p>}
              </div>

              <div>
                <label className="form-label">วิธีการจัดส่ง *</label>
                <select
                  value={shippingForm.shippingMethod}
                  onChange={(e) => handleShippingChange('shippingMethod', e.target.value)}
                  className="form-select"
                  disabled={shippingSubmitting}
                  required
                >
                  <option value="standard">จัดส่งมาตรฐาน (3-5 วัน)</option>
                  <option value="express">จัดส่งด่วน (1-2 วัน)</option>
                  <option value="ems">EMS / ลงทะเบียน</option>
                  <option value="pickup">รับสินค้าที่หน้าร้าน/นัดรับ</option>
                </select>
              </div>

              <div>
                <label className="form-label">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  rows="3"
                  value={shippingForm.shippingNote}
                  onChange={(e) => handleShippingChange('shippingNote', e.target.value)}
                  className="form-textarea"
                  placeholder="เช่น กรุณาติดต่อก่อนจัดส่ง"
                  disabled={shippingSubmitting}
                />
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeShippingModal}
                  disabled={shippingSubmitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-bid-primary"
                  disabled={shippingSubmitting}
                >
                  {shippingSubmitting ? 'กำลังบันทึก...' : 'ยืนยันและชำระเงิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
