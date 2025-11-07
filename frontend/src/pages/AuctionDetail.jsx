import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

export default function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const { user } = useAuth();
  const [highest, setHighest] = useState({ username: null, amount: null });
  const [topBidders, setTopBidders] = useState([]);
  const [isWinner, setIsWinner] = useState(false);
  const [hasPaymentTransaction, setHasPaymentTransaction] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  const socket = useMemo(() => io(SOCKET_URL), []);

  const checkWinner = async (auctionData) => {
    try {
      // Get payment transaction to find winner
      const { data: transactions } = await api.get('/payments/transactions');
      const transaction = transactions.find(t => t.auction_id === parseInt(id));
      if (transaction) {
        setWinnerInfo({
          username: transaction.winner_username,
          amount: transaction.amount,
          isCurrentUser: user && transaction.winner_id === user.id
        });
        if (user && transaction.winner_id === user.id) {
          setIsWinner(true);
        }
      }
    } catch (e) {
      console.error('Error checking winner:', e);
    }
  };

  useEffect(() => {
    api.get(`/auctions/${id}`).then(({ data }) => {
      setAuction(data);
      // Check if auction ended and get winner info
      if (new Date(data.end_time) <= new Date()) {
        checkWinner(data);
      }
    });
    
    // Load user balance if logged in
    if (user) {
      api.get('/users/me').then(({ data }) => {
        setUserBalance(data.balance);
      }).catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    if (auction && user) {
      // Check if user is the winner
      const winner = topBidders.find(bidder => bidder.amount === auction.current_price);
      setIsWinner(winner && winner.user_id === user.id);
      
      // Check if payment transaction exists
      if (isWinner) {
        checkPaymentTransaction();
      }
    }
  }, [auction, user, topBidders, isWinner]);

  const checkPaymentTransaction = async () => {
    try {
      const { data } = await api.get('/payments/transactions');
      const existingTransaction = data.find(t => t.auction_id === parseInt(id));
      setHasPaymentTransaction(!!existingTransaction);
    } catch (error) {
      console.error('Error checking payment transaction:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      await api.post('/payments/transactions', { auction_id: parseInt(id) });
      alert('Payment transaction created successfully! You can now proceed with payment.');
      setHasPaymentTransaction(true);
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      alert('Failed to create payment transaction');
    }
  };

  useEffect(() => {
    socket.emit('joinAuction', Number(id));
    socket.on('bidUpdated', ({ auctionId, amount, ended }) => {
      if (Number(auctionId) === Number(id)) {
        setAuction((prev) => prev ? { ...prev, current_price: amount } : prev);
        // refresh highest bidder
        api.get(`/auctions/${id}/highest-bid`).then(({ data }) => setHighest(data));
        api.get(`/auctions/${id}/top-bidders`).then(({ data }) => setTopBidders(data));
        // refresh recent bids list so the new bid shows up immediately
        api.get(`/auctions/${id}`).then(({ data }) => setAuction((prev) => prev ? { ...prev, bids: data.bids } : prev));
        // If auction ended, refresh all data
        if (ended) {
          api.get(`/auctions/${id}`).then(({ data }) => setAuction(data));
          // Refresh user balance if logged in
          if (user) {
            api.get('/users/me').then(({ data }) => {
              // Update user balance in context if needed
              window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: data.balance }));
            }).catch(() => {});
          }
        }
      }
    });
    socket.on('auctionEnded', ({ auctionId, winnerId, winnerUsername, finalPrice }) => {
      if (Number(auctionId) === Number(id)) {
        // Update now to force ended state
        setNow(Date.now());
        
        // Refresh auction data
        api.get(`/auctions/${id}`).then(({ data }) => {
          setAuction(data);
          checkWinner(data);
        });
        api.get(`/auctions/${id}/top-bidders`).then(({ data }) => setTopBidders(data));
        
        // Set winner info
        setWinnerInfo({
          username: winnerUsername,
          amount: finalPrice,
          isCurrentUser: user && user.id === winnerId
        });
        
        // Check if current user is winner
        if (user && user.id === winnerId) {
          setIsWinner(true);
          checkPaymentTransaction();
        }
      }
    });
    socket.on('bidError', (msg) => setError(msg.message || 'Bid failed'));
    return () => socket.disconnect();
  }, [socket, id, user]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get(`/auctions/${id}/highest-bid`).then(({ data }) => setHighest(data));
    api.get(`/auctions/${id}/top-bidders`).then(({ data }) => setTopBidders(data));
  }, [id]);

  const endsIn = useMemo(() => {
    if (!auction) return 0;
    return new Date(auction.end_time).getTime() - now;
  }, [auction, now]);

  const ended = endsIn <= 0;

  async function placeBid() {
    setError('');
    if (!user) return setError('Login to bid');
    if (ended) return setError('Auction ended');
    const amount = Number(bid);
    
    // Different validation based on bid type
    if (auction.bid_type === 'increment') {
      if (!amount || amount <= Number(auction.current_price)) return setError('Enter a higher amount');
      if (auction.minimum_increment && amount < Number(auction.current_price) + Number(auction.minimum_increment)) {
        return setError(`Bid must be at least ฿${(Number(auction.current_price) + Number(auction.minimum_increment)).toFixed(2)} (current price + minimum increment)`);
      }
    } else if (auction.bid_type === 'sealed') {
      if (!amount || amount < Number(auction.start_price)) return setError(`Bid must be at least the starting price of ฿${Number(auction.start_price).toFixed(2)}`);
    }
    
    try {
      await api.post(`/auctions/${id}/bids`, { amount });
      setBid('');
      // refresh data after success
      const [detail, highestRes, topRes] = await Promise.all([
        api.get(`/auctions/${id}`),
        api.get(`/auctions/${id}/highest-bid`),
        api.get(`/auctions/${id}/top-bidders`)
      ]);
      setAuction(detail.data);
      setHighest(highestRes.data);
      setTopBidders(topRes.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Bid failed');
    }
  }

  async function handleBuyNow() {
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    
    // Check user balance first
    let currentBalance = userBalance;
    if (currentBalance === null) {
      try {
        const userResponse = await api.get('/users/me');
        currentBalance = userResponse.data.balance;
        setUserBalance(currentBalance);
      } catch (e) {
        setError('ไม่สามารถตรวจสอบยอดเงินได้ กรุณาลองใหม่อีกครั้ง');
        return;
      }
    }
    
    const buyNowPrice = Number(auction.buy_now_price);
    
    // Check if user has sufficient balance
    if (Number(currentBalance) < buyNowPrice) {
      setError(`ยอดเงินไม่เพียงพอ! คุณมี ฿${Number(currentBalance).toFixed(2)} แต่ต้องการ ฿${buyNowPrice.toFixed(2)}`);
      alert(`ยอดเงินไม่เพียงพอ!\n\nคุณมี: ฿${Number(currentBalance).toFixed(2)}\nต้องการ: ฿${buyNowPrice.toFixed(2)}`);
      return;
    }
    
    if (!window.confirm(`คุณต้องการซื้อสินค้านี้ทันทีในราคา ฿${buyNowPrice.toFixed(2)} หรือไม่?\n\nยอดเงินของคุณ: ฿${Number(currentBalance).toFixed(2)}\nยอดเงินหลังซื้อ: ฿${(Number(currentBalance) - buyNowPrice).toFixed(2)}`)) {
      return;
    }
    
    setBuyNowLoading(true);
    setError('');
    
    try {
      const response = await api.post(`/auctions/${id}/buy-now`);
      
      // Force refresh auction data immediately
      const [detail, highestRes, topRes, userResponse] = await Promise.all([
        api.get(`/auctions/${id}`),
        api.get(`/auctions/${id}/highest-bid`),
        api.get(`/auctions/${id}/top-bidders`),
        api.get('/users/me')
      ]);
      
      setAuction(detail.data);
      setHighest(highestRes.data);
      setTopBidders(topRes.data);
      setUserBalance(userResponse.data.balance);
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: userResponse.data.balance }));
      
      // Update now to force ended state
      setNow(Date.now());
      
      // Set winner info
      setWinnerInfo({
        username: user.username,
        amount: buyNowPrice,
        isCurrentUser: true
      });
      
      // Mark user as winner
      setIsWinner(true);
      checkPaymentTransaction();
      
      alert('✅ ซื้อสินค้าสำเร็จ!\n\nคุณได้ซื้อสินค้านี้ในราคา ฿' + buyNowPrice.toFixed(2) + '\nกรุณาไปที่หน้า Payments เพื่อชำระเงิน');
      
      // Redirect to payments page after a short delay
      setTimeout(() => {
        window.location.href = '/payments';
      }, 2000);
    } catch (e) {
      console.error('Buy Now error:', e);
      const errorMessage = e.response?.data?.message || 'การซื้อล้มเหลว';
      setError(errorMessage);
      alert('❌ ' + errorMessage);
    } finally {
      setBuyNowLoading(false);
    }
  }

  if (!auction) {
    return (
      <div className="page">
        <div className="container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading auction...</span>
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
            <h1 className="page-title">🏆 {auction.title}</h1>
            <p className="page-subtitle">รายละเอียดการประมูลและการเสนอราคา</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Product Image and Description Section */}
          <div className="auction-hero-section mb-8">
            <div className="auction-hero-grid">
              {/* Left Column - Image and Highest Bidder */}
              <div className="auction-left-column">
                {/* Product Image */}
                <div className="auction-image-container">
                  {auction.image ? (
                    <img 
                      src={auction.image.startsWith('http') ? auction.image : `http://localhost:4000${auction.image}`}
                      alt={auction.title}
                      className="auction-main-image"
                      onError={(e) => {
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
                      <span className="no-image-icon">🖼️</span>
                      <span className="no-image-text">No Image Available</span>
                    </div>
                  </div>
                </div>

                {/* Highest Bidder - Under Image */}
                <div className="auction-highest-bidder">
                  <div className="highest-bidder-header">
                    <h3 className="highest-bidder-title">👑 ผู้เสนอราคาสูงสุด</h3>
                  </div>
                  <div className="highest-bidder-content">
                    {highest.username ? (
                      <div className="bidder-table">
                        <div className="bidder-table-header">
                          <div className="bid-amount-header">จำนวนเงินเสนอ</div>
                          <div className="bid-date-header">วันที่และเวลาเสนอราคา</div>
                        </div>
                        <div className="bidder-table-row">
                          <div className="bid-amount">฿{Number(highest.amount).toFixed(2)}</div>
                          <div className="bid-date">{new Date(highest.created_at || Date.now()).toLocaleString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-bids">ยังไม่มีผู้เสนอราคา</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="auction-description-container">
                <div className="auction-description-header">
                  <h2 className="auction-description-title">{auction.title}</h2>
                  <div className="auction-type-badge">
                    <span className={`type-badge ${auction.bid_type}`}>
                      {auction.bid_type === 'increment' ? '📈 Increment Bidding' : '🔒 Sealed Bidding'}
                    </span>
                  </div>
                </div>
                
                <div className="auction-description-content">
                  <h3 className="description-label">คำอธิบายสินค้า</h3>
                  <div className="description-text">
                    {auction.description ? (
                      <p>{auction.description}</p>
                    ) : (
                      <p className="no-description">ผู้ขายไม่ได้ให้คำอธิบายสินค้า</p>
                    )}
                  </div>
                </div>

                {/* Seller Information */}
                <div className="auction-seller-info">
                  <div className="seller-header">
                    <div className="seller-icon">👤</div>
                    <div className="seller-details">
                      <h3 className="seller-label">ผู้ขาย</h3>
                      <div className="seller-name">{auction.owner_username || 'ไม่ระบุ'}</div>
                    </div>
                  </div>
                </div>

                <div className="auction-price-info">
                  <div className="price-row">
                    <span className="price-label">ราคาเริ่มต้น:</span>
                    <span className="price-value">฿{Number(auction.start_price).toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">
                      {auction.bid_type === 'increment' ? 'ราคาปัจจุบัน:' : 'ราคาเริ่มต้น:'}
                    </span>
                    <span className="price-value current-price">฿{Number(auction.current_price).toFixed(2)}</span>
                  </div>
                  {auction.bid_type === 'increment' && auction.minimum_increment && (
                    <div className="price-row">
                      <span className="price-label">บิดขั้นต่ำ:</span>
                      <span className="price-value">฿{Number(auction.minimum_increment).toFixed(2)}</span>
                    </div>
                  )}
                  {auction.buy_now_price && (
                    <div className="price-row">
                      <span className="price-label">ราคาปิดประมูลด่วน:</span>
                      <span className="price-value font-bold text-green-600">฿{Number(auction.buy_now_price).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Buy Now Button - Show if buy_now_price exists and auction is active */}
                {!ended && auction.buy_now_price && user && user.role !== 'admin' && user.id !== auction.user_id && (
                  <div className="auction-buy-now-section mb-6">
                    <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                      <div className="card-body">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-800 mb-2">⚡ ปิดประมูลด่วน</h3>
                            <p className="text-green-700">
                              ซื้อสินค้านี้ทันทีในราคา <span className="font-bold text-xl">฿{Number(auction.buy_now_price).toFixed(2)}</span>
                            </p>
                            <p className="text-sm text-green-600 mt-1">ไม่ต้องรอการประมูลจบ</p>
                            {userBalance !== null && (
                              <p className="text-sm text-gray-600 mt-2">
                                ยอดเงินของคุณ: <span className={Number(userBalance) < Number(auction.buy_now_price) ? 'text-red-600 font-bold' : 'text-gray-700 font-semibold'}>฿{Number(userBalance).toFixed(2)}</span>
                                {Number(userBalance) < Number(auction.buy_now_price) && (
                                  <span className="text-red-600 ml-2">⚠️ ยอดเงินไม่เพียงพอ</span>
                                )}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleBuyNow}
                            disabled={buyNowLoading || ended || (userBalance !== null && Number(userBalance) < Number(auction.buy_now_price))}
                            className="btn btn-primary btn-lg px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {buyNowLoading ? (
                              <div className="loading">
                                <div className="spinner"></div>
                                <span>กำลังดำเนินการ...</span>
                              </div>
                            ) : (
                              <>
                                <span>⚡</span>
                                <span>ซื้อทันที</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bidding Form - Moved up here */}
                {user && user.role !== 'admin' && (
                  <div className="auction-bidding-section">
                    <div className="bidding-header">
                      <div className="bidding-title-section">
                        <div className="bidding-icon">💰</div>
                        <div className="bidding-title-text">
                          <span className="bidding-title-line">เสนอราคาของคุณ</span>
                        </div>
                      </div>
                      
                      <div className="bidding-status-section">
                        <div className="status-icon">⏰</div>
                        <div className="status-text">
                          <span className="status-label">เวลาที่เหลือ:</span>
                          <span className="status-value">
                            {ended ? 'การประมูลจบแล้ว' : `${Math.max(0, Math.floor(endsIn / 1000))} วินาที`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bidding-action-section">
                        <button 
                          onClick={() => {
                            const auctionInfoSection = document.getElementById('auction-info-section');
                            if (auctionInfoSection) {
                              auctionInfoSection.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }}
                          className="btn btn-outline detail-btn-inline"
                        >
                          📋 รายละเอียด
                        </button>
                      </div>
                    </div>
                    
                <div className="bidding-form">
                  <div className="form-group">
                    <label className="form-label">
                      {auction.bid_type === 'increment' ? 'Bid Amount' : 'Maximum Bid'}
                    </label>
                    <div className="bidding-input-group">
                      <input
                        type="number"
                        value={bid}
                        onChange={(e) => setBid(e.target.value)}
                        placeholder={
                          auction.bid_type === 'increment' 
                            ? `Enter amount higher than ฿${Number(auction.current_price).toFixed(2)}`
                            : `Enter your maximum bid (min: ฿${Number(auction.start_price).toFixed(2)})`
                        }
                        min={auction.bid_type === 'increment' ? Number(auction.current_price) + 0.01 : Number(auction.start_price)}
                        step="0.01"
                        className="form-input bidding-input"
                      />
                      <button 
                        onClick={placeBid} 
                        disabled={ended}
                        className="btn btn-primary bidding-btn"
                      >
                        {ended ? 'Auction Ended' : (auction.bid_type === 'sealed' ? 'Submit Bid' : 'Place Bid')}
                      </button>
                    </div>
                    {error && <div className="form-error">{error}</div>}
                  </div>
                  
                </div>
                  </div>
                )}

                {!user && (
                  <div className="auction-login-prompt">
                    <div className="login-prompt-content">
                      <p className="login-text">กรุณาเข้าสู่ระบบเพื่อเสนอราคา</p>
                      <a href="/login" className="btn btn-primary">เข้าสู่ระบบ</a>
                    </div>
                  </div>
                )}

                {user && user.role === 'admin' && (
                  <div className="auction-admin-notice">
                    <div className="admin-notice-content">
                      <div className="admin-notice-icon">⚙️</div>
                      <div className="admin-notice-text">
                        <h3 className="admin-notice-title">Admin Access</h3>
                        <p className="admin-notice-description">
                          As an admin, you cannot participate in auctions. You can only manage and monitor the system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                {auction.bid_type === 'sealed' && (
                  <div className="auction-sealed-info">
                    <div className="sealed-info-header">
                      <h3 className="sealed-info-title">🔒 Sealed Bidding</h3>
                    </div>
                    <div className="sealed-info-content">
                      <p className="sealed-description">
                        Submit your maximum bid. Only the highest bidder will be revealed when the auction ends.
                      </p>
                      {highest.sealed && (
                        <div className="sealed-status">
                          <span>🔒</span>
                          <span>Bids are hidden until auction ends</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Auction Info */}
            <div className="space-y-6">
              {/* Auction Details */}
              <div className="card" id="auction-info-section">
                <div className="card-header">
                  <h2 className="card-title">📋 Auction Information</h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Time</label>
                      <p className="text-lg">{new Date(auction.end_time).toLocaleString()}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Auction Status</label>
                      <p className="text-lg">
                        {ended ? (
                          <span className="text-red-600 font-semibold">Ended</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Active</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Time Remaining</label>
                      <p className="text-lg">
                        {ended ? (
                          <span className="text-red-600">Auction has ended</span>
                        ) : (
                          <span className="text-green-600">
                            {Math.max(0, Math.floor(endsIn / 1000))} seconds
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Winner Information */}
                    {ended && winnerInfo && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                        <label className="text-sm font-medium text-gray-700 block mb-2">🏆 ผู้ชนะการประมูล</label>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-green-700">
                            {winnerInfo.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            ราคาที่ชนะ: <span className="font-semibold text-green-600">฿{Number(winnerInfo.amount).toFixed(2)}</span>
                          </p>
                          {winnerInfo.isCurrentUser && (
                            <p className="text-sm font-semibold text-green-600 mt-2">
                              🎉 คุณคือผู้ชนะ!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bidding */}
            <div className="space-y-6">



              {/* Top Bidders / Sealed Info */}
              {auction.bid_type === 'increment' ? (
                <>
                  {topBidders.length > 0 && (
                    <div className="card">
                      <div className="card-header">
                        <h2 className="card-title">🏆 Top 5 Bidders</h2>
                      </div>
                      <div className="card-body">
                        <div className="space-y-2">
                          {topBidders.map((bidder, index) => (
                            <div key={bidder.username} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">#{index + 1} {bidder.username}</span>
                              <span className="font-bold text-primary">฿{Number(bidder.top_amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <div className="card-header">
                      <h2 className="card-title">📝 Recent Bids</h2>
                    </div>
                    <div className="card-body">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(auction.bids || []).map(bid => (
                          <div key={bid.id} className="flex justify-between items-center p-2 border-b">
                            <div>
                              <span className="font-medium">{bid.username}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(bid.created_at).toLocaleString()}
                              </span>
                            </div>
                            <span className="font-bold text-primary">฿{Number(bid.amount).toFixed(2)}</span>
                          </div>
                        ))}
                        {(!auction.bids || auction.bids.length === 0) && (
                          <p className="text-gray-500 text-center py-4">No bids yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">🔒 Sealed Bidding Information</h2>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                          <h4 className="font-semibold">Private Bidding</h4>
                          <p className="text-sm text-gray-600">Your bid amount is confidential and will only be revealed when the auction ends.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <h4 className="font-semibold">One Bid Per Person</h4>
                          <p className="text-sm text-gray-600">You can only submit one bid per auction. Make it count!</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h4 className="font-semibold">Highest Bid Wins</h4>
                          <p className="text-sm text-gray-600">The person with the highest bid will win the auction when it ends.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Section for Winner */}
              {ended && isWinner && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">🎉 Congratulations! You Won This Auction</h2>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <h4 className="font-semibold text-green-800">You are the winner!</h4>
                            <p className="text-sm text-green-700">
                              You won this auction with a bid of ${Number(auction.current_price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!hasPaymentTransaction ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                          <p className="text-sm text-blue-700 mb-4">
                            Create a payment transaction to proceed with the purchase.
                          </p>
                          <button
                            onClick={handleCreatePayment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            💳 Create Payment Transaction
                          </button>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Payment Transaction Created</h4>
                          <p className="text-sm text-green-700 mb-4">
                            Your payment transaction has been created. You can now proceed with payment.
                          </p>
                          <a
                            href="/payments"
                            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            💳 Go to Payments
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}