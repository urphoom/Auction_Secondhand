import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

export default function Payment() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadBalance();
    }
  }, [user]);

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


  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/payments/transactions');
      
      // Load payment statuses
      const statuses = {};
      data.forEach(transaction => {
        if (transaction.status === 'paid' || transaction.status === 'shipped' || transaction.status === 'delivered' || transaction.status === 'completed') {
          statuses[transaction.id] = {
            paid: true,
            paidAt: transaction.paid_at || transaction.created_at,
            sellerAmount: transaction.seller_amount,
            platformFee: transaction.platform_fee
          };
        }
      });
      setPaymentStatuses(statuses);
      
      // Filter to show only transactions where user is the winner (not seller)
      const buyerTransactions = data.filter(transaction => transaction.winner_id === user.id);
      setTransactions(buyerTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      alert('Failed to load payment transactions: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const { data } = await api.get('/payments/balance');
      setBalance(data.balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

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

  const handlePay = async (transactionId) => {
    try {
      const { data } = await api.post(`/payments/transactions/${transactionId}/pay`);
      
      // Update payment status
      setPaymentStatuses(prev => ({
        ...prev,
        [transactionId]: {
          paid: true,
          paidAt: new Date().toISOString(),
          sellerAmount: data.seller_amount,
          platformFee: data.platform_fee
        }
      }));
      
      alert(`ชำระเงินเรียบร้อยแล้ว!\nผู้ขายได้รับ: $${data.seller_amount}\nค่าธรรมเนียมแพลตฟอร์ม: $${data.platform_fee}`);
      loadTransactions();
      loadBalance(); // Refresh balance after payment
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('ไม่สามารถชำระเงินได้');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-green-800 bg-green-200';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอการชำระเงิน';
      case 'paid': return 'ชำระเงินแล้ว';
      case 'shipped': return 'จัดส่งแล้ว';
      case 'delivered': return 'ได้รับสินค้าแล้ว';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getTransactionCardColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-50 border-2 border-orange-200';
      case 'paid': return 'bg-blue-50 border-2 border-blue-200';
      case 'shipped': return 'bg-yellow-50 border-2 border-yellow-200';
      case 'delivered': return 'bg-green-50 border-2 border-green-200';
      case 'completed': return 'bg-green-100 border-2 border-green-300';
      default: return 'bg-white border border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '💳';
      case 'shipped': return '📦';
      case 'delivered': return '✅';
      case 'completed': return '🎉';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">การชำระเงิน</h1>
              <p className="mt-2 text-gray-600">จัดการการชำระเงินสำหรับสินค้าที่คุณชนะการประมูล</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-green-600 font-medium">Account Balance</p>
                  <p className="text-2xl font-bold text-green-800">${Number(balance).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="order-management-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">ค้นหารายการชำระเงิน</label>
              <input
                type="text"
                placeholder="ค้นหาตามชื่อสินค้า, ผู้ชนะ, ผู้ขาย..."
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
                <option value="shipped">จัดส่งแล้ว</option>
                <option value="delivered">ได้รับสินค้าแล้ว</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
            </div>
          </div>
        </div>


        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3 className="empty-title">ไม่มีรายการชำระเงิน</h3>
            <p className="empty-description">คุณยังไม่ชนะการประมูลใดๆ หรือยังไม่มีรายการชำระเงิน</p>
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
            {filteredTransactions.map((transaction, index) => {
              const imageSrc = transaction.auction_image 
                ? (transaction.auction_image.startsWith('http') ? transaction.auction_image : `http://localhost:4000${transaction.auction_image}`)
                : '/api/placeholder/80/80';

              return (
                <div key={transaction.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-image">
                      {transaction.auction_image ? (
                        <img 
                          src={imageSrc} 
                          alt={transaction.auction_title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="payment-no-image"
                        style={{ display: transaction.auction_image ? 'none' : 'flex' }}
                      >
                        <div className="no-image-content">
                          <div className="no-image-icon">📦</div>
                          <div className="no-image-text">ไม่มีรูปภาพ</div>
                        </div>
                      </div>
                    </div>
                    <div className="payment-info">
                      <h3 className="payment-title">{transaction.auction_title}</h3>
                      <div className="payment-price">฿{Number(transaction.amount).toFixed(2)}</div>
                      <span className={`payment-status ${getStatusBadgeColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)} {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    <div className="detail-row">
                      <span className="detail-label">ผู้ชนะ:</span>
                      <span className="detail-value">{transaction.winner_username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ผู้ขาย:</span>
                      <span className="detail-value">{transaction.seller_username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">วันที่:</span>
                      <span className="detail-value">{new Date(transaction.created_at).toLocaleDateString('th-TH')}</span>
                    </div>


                    {transaction.estimated_delivery && (
                      <div className="detail-row">
                        <span className="detail-label">วันที่คาดถึง:</span>
                        <span className="detail-value">{new Date(transaction.estimated_delivery).toLocaleDateString('th-TH')}</span>
                      </div>
                    )}

                    {transaction.tracking_number && (
                      <div className="detail-row">
                        <span className="detail-label">หมายเลขติดตาม:</span>
                        <span className="detail-value font-semibold text-blue-600">{transaction.tracking_number}</span>
                      </div>
                    )}

                    {transaction.shipping_method && (
                      <div className="detail-row">
                        <span className="detail-label">วิธีการจัดส่ง:</span>
                        <span className="detail-value">{transaction.shipping_method}</span>
                      </div>
                    )}

                    {transaction.notes && (
                      <div className="detail-row">
                        <span className="detail-label">หมายเหตุ:</span>
                        <div className="detail-value mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                          {transaction.notes}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <>
                      {transaction.winner_id === user.id && transaction.status === 'pending' && (
                        paymentStatuses[transaction.id]?.paid ? (
                          <div className="payment-status-display">
                            <div className="payment-status-badge">
                              <span className="payment-status-icon">✅</span>
                              <span className="payment-status-text">ชำระเงินแล้ว</span>
                            </div>
                            <div className="payment-status-time">
                              {new Date(paymentStatuses[transaction.id].paidAt).toLocaleString('th-TH')}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePay(transaction.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            💳 ชำระเงิน
                          </button>
                        )
                      )}

                      {transaction.winner_id === user.id && transaction.status === 'shipped' && (
                        <button
                          onClick={() => handleDeliver(transaction.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✅ ยืนยันว่าได้รับสินค้าแล้ว
                        </button>
                      )}

                      {transaction.winner_id === user.id && transaction.status === 'delivered' && (
                        <div className="payment-status-display">
                          <div className="payment-status-badge">
                            <span className="payment-status-icon">🎉</span>
                            <span className="payment-status-text">ได้รับสินค้าแล้ว</span>
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
