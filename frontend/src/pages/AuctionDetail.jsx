import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import {
  Clock,
  Gavel,
  Tag,
  Zap,
  User,
  Users,
  Info,
  Circle,
  Star
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

/** ราคาขั้นต่ำที่ยอมรับได้สำหรับแบบ increment — ตรงกับ backend (current + minimum_increment หรือมากกว่าราคาปัจจุบันเล็กน้อย) */
function getMinNextBidIncrement(auction) {
  if (!auction || auction.bid_type !== 'increment') return 0;
  const cur = Number(auction.current_price);
  const raw = auction.minimum_increment;
  const inc = raw != null && raw !== '' ? Number(raw) : NaN;
  if (Number.isFinite(inc) && inc > 0) return cur + inc;
  return cur + 0.01;
}

export default function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bid, setBid] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const { user } = useAuth();
  const [highest, setHighest] = useState({ username: null, amount: null });
  const [topBidders, setTopBidders] = useState([]);
  const [ownerBids, setOwnerBids] = useState([]);
  const [isWinner, setIsWinner] = useState(false);
  const [hasPaymentTransaction, setHasPaymentTransaction] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidHistoryOpen, setBidHistoryOpen] = useState(false);
  const [endOverlay, setEndOverlay] = useState(null); // { kind: 'won'|'lost', text: string } | null

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
      setSelectedImageIndex(0);
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
    const auctionId = Number(id);

    const handleBidUpdated = ({ auctionId: updatedAuctionId, amount, ended }) => {
      if (Number(updatedAuctionId) === auctionId) {
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
    };

    const handleAuctionEnded = ({ auctionId: endedAuctionId, winnerId, winnerUsername, finalPrice }) => {
      if (Number(endedAuctionId) === auctionId) {
        // Update now to force ended state
        setNow(Date.now());
        
        // Refresh auction data
        api.get(`/auctions/${id}`).then(({ data }) => {
          setAuction(data);
          checkWinner(data);
        });
        api.get(`/auctions/${id}/top-bidders`).then(({ data }) => setTopBidders(data));
        
        // Set winner info (if any)
        if (winnerId) {
          setWinnerInfo({
            username: winnerUsername,
            amount: finalPrice,
            isCurrentUser: user && user.id === winnerId
          });

          // Check if current user is winner
          if (user && user.id === winnerId) {
            setIsWinner(true);
            checkPaymentTransaction();
            // Winner overlay (no winner name shown)
            setEndOverlay({ kind: 'won', text: 'ยินดีด้วยคุณชนะการประมูลนี้' });
          } else if (user && auction && user.id !== auction.user_id) {
            // Loser overlay: show only if user actually bid (important for sealed auctions)
            api
              .get(`/auctions/${id}/has-bid`)
              .then(({ data }) => {
                if (data?.hasBid) {
                  setEndOverlay({ kind: 'lost', text: 'การประมูลจบแล้ว คุณไม่ได้เป็นผู้ชนะ' });
                }
              })
              .catch(() => {});
          }
        } else {
          setWinnerInfo(null);
          setIsWinner(false);
        }
      }
    };

    const handleBidError = (msg) => setError(msg.message || 'Bid failed');

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('joinAuction', auctionId);
    socket.on('bidUpdated', handleBidUpdated);
    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('bidError', handleBidError);
    return () => {
      socket.emit('leaveAuction', auctionId);
      socket.off('bidUpdated', handleBidUpdated);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('bidError', handleBidError);
    };
  }, [socket, id, user]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get(`/auctions/${id}/highest-bid`).then(({ data }) => setHighest(data));
    api.get(`/auctions/${id}/top-bidders`).then(({ data }) => setTopBidders(data));
  }, [id]);

  // Load full bid history for owner on sealed auctions
  useEffect(() => {
    if (!auction || !user) return;
    if (auction.bid_type !== 'sealed') return;
    if (auction.user_id !== user.id) return;

    api
      .get(`/auctions/${id}/bids/owner`)
      .then(({ data }) => {
        setOwnerBids(data.bids || []);
      })
      .catch(() => {
        setOwnerBids([]);
      });
  }, [auction, user, id]);

  const endsIn = useMemo(() => {
    if (!auction) return 0;
    return new Date(auction.end_time).getTime() - now;
  }, [auction, now]);

  const ended = endsIn <= 0;
  const [finalizeRequested, setFinalizeRequested] = useState(false);

  const bidsForHistory = auction?.bids || [];
  const highestBidAmount = bidsForHistory.length
    ? Math.max(...bidsForHistory.map((b) => Number(b.amount)))
    : null;

  const myBestBidAmount = useMemo(() => {
    if (!user || !bidsForHistory.length) return null;
    const mine = bidsForHistory
      .filter((b) => Number(b.user_id) === Number(user.id))
      .map((b) => Number(b.amount))
      .filter((n) => Number.isFinite(n));
    if (!mine.length) return null;
    return Math.max(...mine);
  }, [bidsForHistory, user]);

  const maskBidUsername = (username, index) => {
    const suffix = String(index + 1).padStart(3, '0');
    return `u***${suffix}`;
  };

  const formatBidDateTime = (value) => {
    const d = new Date(value || Date.now());
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRemaining = (ms) => {
    if (ms <= 0) return 'การประมูลจบแล้ว';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days} วัน`);
    if (hours > 0 || days > 0) parts.push(`${hours} ชั่วโมง`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} นาที`);
    parts.push(`${seconds} วินาที`);
    return parts.join(' ');
  };

  // When countdown reaches 0, ask backend to finalize immediately (winner/loser notifications + socket event).
  useEffect(() => {
    if (!auction) return;
    if (!ended) return;
    if (finalizeRequested) return;

    setFinalizeRequested(true);
    api.post(`/auctions/${id}/finalize`).catch(() => {});
  }, [auction, ended, finalizeRequested, id]);

  const fmtMoney = (v) => formatCurrency(v);

  function openBidConfirm() {
    setError('');
    if (!user) {
      setError('Login to bid');
      return;
    }
    if (ended) {
      setError('Auction ended');
      return;
    }
    const amount = Number(bid);
    if (!amount || Number.isNaN(amount)) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    // Validation per bid type (same rule as backend)
    if (auction.bid_type === 'increment') {
      if (amount <= Number(auction.current_price)) {
        setError('Enter a higher amount');
        return;
      }
      if (auction.minimum_increment && amount < Number(auction.current_price) + Number(auction.minimum_increment)) {
        setError(`Bid must be at least ${fmtMoney(Number(auction.current_price) + Number(auction.minimum_increment))} (current price + minimum increment)`);
        return;
      }
    } else if (auction.bid_type === 'sealed') {
      if (amount < Number(auction.start_price)) {
        setError(`Bid must be at least the starting price of ${fmtMoney(auction.start_price)}`);
        return;
      }
    }

    setBidModalOpen(true);
  }

  async function placeBid() {
    setError('');
    if (!user) {
      setError('Login to bid');
      return;
    }
    if (ended) {
      setError('Auction ended');
      return;
    }

    const amount = Number(bid);
    
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
    } finally {
      setBidModalOpen(false);
    }
  }

  async function handleBuyNowConfirm() {
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
      setError(`ยอดเงินไม่เพียงพอ! คุณมี ${fmtMoney(currentBalance)} แต่ต้องการ ${fmtMoney(buyNowPrice)}`);
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
      
      alert('ซื้อสินค้าสำเร็จ!\n\nคุณได้ซื้อสินค้านี้ในราคา ' + fmtMoney(buyNowPrice) + '\nกรุณาไปที่หน้า Payments เพื่อชำระเงิน');
      
      // Redirect to payments page after a short delay
      setTimeout(() => {
        window.location.href = '/payments';
      }, 2000);
    } catch (e) {
      console.error('Buy Now error:', e);
      const errorMessage = e.response?.data?.message || 'การซื้อล้มเหลว';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setBuyNowLoading(false);
      setBuyNowModalOpen(false);
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
    <div className="page auction-detail-page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">{auction.title}</h1>
            <p className="page-subtitle">รายละเอียดการประมูลและการเสนอราคา</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Product Image and Summary Section */}
          <div className="auction-hero-section">
            <div className="auction-hero-grid">
              {/* Left Column - Image and Highest Bidder */}
              <div className="auction-left-column">
                {/* Product Image */}
                <div className="auction-image-container">
                  {(() => {
                    const rawImages = Array.isArray(auction.images) ? auction.images : (auction.image ? [auction.image] : []);
                    const images = rawImages.filter(Boolean);
                    if (!images.length) {
                      return (
                        <div className="auction-no-image" style={{ display: 'flex' }}>
                          <div className="no-image-content">
                            <span className="no-image-text">No Image Available</span>
                          </div>
                        </div>
                      );
                    }

                    const current = images[Math.min(selectedImageIndex, images.length - 1)];
                    const toSrc = (p) => (p.startsWith('http') ? p : `${BACKEND_ORIGIN}${p.startsWith('/') ? '' : '/'}${p}`);

                    return (
                      <div className="auction-image-gallery">
                        <div className="auction-image-gallery__main">
                          <img
                            src={toSrc(current)}
                            alt={auction.title}
                            className="auction-main-image preview-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        {images.length > 1 && (
                          <div className="auction-image-gallery__thumbs">
                            {images.slice(0, 5).map((img, idx) => (
                              <button
                                key={`${img}-${idx}`}
                                type="button"
                                className={`auction-image-thumb ${idx === selectedImageIndex ? 'is-active' : ''}`}
                                onClick={() => setSelectedImageIndex(idx)}
                                title={`รูปที่ ${idx + 1}`}
                              >
                                <img src={toSrc(img)} alt={`Thumbnail ${idx + 1}`} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Highest Bidder - Under Image */}
                <div className="auction-highest-bidder">
                  <div className="highest-bidder-header">
                    <h3 className="highest-bidder-title">
                      <Users className="inline-block w-5 h-5 mr-2 text-gray-400" />
                      ราคาสูงสุด
                    </h3>
                  </div>
                  <div className="highest-bidder-content">
                    {highest.username ? (
                      <div className="bidder-table">
                        <div className="bidder-table-header">
                          <div className="bid-amount-header">จำนวนเงินเสนอ</div>
                          <div className="bid-date-header">วันที่และเวลาเสนอราคา</div>
                        </div>
                        <div className="bidder-table-row">
                          <div className="bid-amount">{fmtMoney(highest.amount)}</div>
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

              {/* Right Column - Minimal Summary & Bidding */}
              <div className="auction-description-container auction-summary-card">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div>
                    <h2 className="auction-description-title">{auction.title}</h2>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500">
                      <Tag className="w-4 h-4" />
                      <span>{auction.bid_type === 'increment' ? 'Increment bidding' : 'Sealed bidding'}</span>
                    </div>
                  </div>
                </div>

                {/* Price summary + remaining time */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">ราคาเปิดประมูล</p>
                      <p className="auction-price-main">{fmtMoney(auction.start_price)}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span>{bidsForHistory.length} bids</span>
                        <button
                          type="button"
                          className="text-primary-600 font-semibold hover:underline"
                          onClick={() => setBidHistoryOpen(true)}
                        >
                          โชว์ประวัติการประมูล
                        </button>
                      </div>
                    </div>
                    {user && user.role !== 'admin' && auction.user_id !== user.id && (
                      <div className="text-right">
                        <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">ราคาที่คุณเสนอ</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {myBestBidAmount !== null ? fmtMoney(myBestBidAmount) : '—'}
                        </p>
                        {auction.bid_type === 'increment' && !ended && myBestBidAmount !== null && highestBidAmount !== null && (
                          <p
                            className={`mt-1 text-xs font-semibold ${
                              Number(myBestBidAmount) === Number(highestBidAmount)
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {Number(myBestBidAmount) === Number(highestBidAmount)
                              ? 'คุณคือผู้เสนอราคาที่สูงสุดในขณะนี้'
                              : 'ยังไม่ใช่ราคาที่สูงสุดในขณะนี้'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>เวลาที่เหลือ</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatRemaining(endsIn)}
                    </div>
                  </div>
                </div>

                {/* Buy now (only when there are no bids yet) */}
                {!ended &&
                  auction.buy_now_price &&
                  user &&
                  user.role !== 'admin' &&
                  user.id !== auction.user_id &&
                  Number(auction.bid_count ?? bidsForHistory.length ?? 0) === 0 && (
                  <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>ซื้อทันที</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {fmtMoney(auction.buy_now_price)} • ปิดประมูลทันที
                        </p>
                        {userBalance !== null && (
                          <p className="mt-1 text-xs text-gray-500">
                            ยอดเงินของคุณ:{' '}
                            <span className={Number(userBalance) < Number(auction.buy_now_price) ? 'text-red-600 font-semibold' : 'text-gray-800 font-semibold'}>
                              {fmtMoney(userBalance)}
                            </span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setBuyNowModalOpen(true)}
                        disabled={buyNowLoading || ended || (userBalance !== null && Number(userBalance) < Number(auction.buy_now_price))}
                        className="btn btn-bid-primary btn-sm whitespace-nowrap"
                      >
                        {buyNowLoading ? 'กำลังดำเนินการ...' : 'ซื้อทันที'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bid form */}
                {user && user.role !== 'admin' && auction.user_id !== user.id && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {auction.bid_type === 'increment' ? 'Bid Amount' : 'Maximum Bid'}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={bid}
                        onChange={(e) => setBid(e.target.value)}
                        placeholder={
                          auction.bid_type === 'increment'
                            ? `Enter amount at least ${fmtMoney(getMinNextBidIncrement(auction))}`
                            : `Enter your maximum bid (min: ${fmtMoney(auction.start_price)})`
                        }
                        min={
                          auction.bid_type === 'increment'
                            ? getMinNextBidIncrement(auction)
                            : Number(auction.start_price)
                        }
                        step="0.01"
                        className="form-input flex-1"
                      />
                      <button
                        onClick={openBidConfirm}
                        disabled={ended}
                        className="btn btn-bid-primary"
                      >
                        {ended ? 'Auction Ended' : (auction.bid_type === 'sealed' ? 'Submit Bid' : 'เสนอราคา')}
                      </button>
                    </div>
                    {error && <div className="form-error mt-2">{error}</div>}
                  </div>
                )}

                {user && auction.user_id === user.id && (
                  <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">คุณเป็นผู้ขายของการประมูลนี้</p>
                    <p className="mt-1">
                      ผู้ขายไม่สามารถบิดการประมูลของตัวเองได้ ระบบจะใช้ราคาจากผู้เข้าร่วมประมูลคนอื่นเท่านั้น
                    </p>
                    {Number(auction.bid_count ?? 0) === 0 && !ended ? (
                      <div className="mt-3">
                        <Link to={`/auctions/${auction.id}/edit`} className="btn btn-secondary btn-sm">
                          แก้ไขข้อมูลการประมูล
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-3 text-amber-700">
                        ไม่สามารถแก้ไขข้อมูลได้เนื่องจากมีการประมูลเกิดขึ้นแล้ว
                      </p>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="mt-6 text-sm text-gray-600">
                    กรุณาเข้าสู่ระบบเพื่อเสนอราคา
                    <a href="/login" className="ml-2 underline text-primary-600">เข้าสู่ระบบ</a>
                  </div>
                )}

                {user && user.role === 'admin' && (
                  <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Admin access</p>
                    <p className="mt-1">
                      คุณเป็นผู้ดูแลระบบ ไม่สามารถเข้าร่วมประมูลได้ หน้านี้สำหรับดูข้อมูลเท่านั้น
                    </p>
                  </div>
                )}

                {auction.bid_type === 'sealed' && (
                  <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-800 mb-1">Sealed bidding</p>
                    <p>ระบบจะเปิดเผยเฉพาะผู้ชนะเมื่อการประมูลสิ้นสุดลงเท่านั้น</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs: รายละเอียด / ข้อมูลการประมูล / ประวัติ */}
          <div className="auction-tabs">
            <div className="auction-tabs-nav">
              <button
                type="button"
                className={`auction-tab-button ${activeTab === 'details' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <Info className="w-4 h-4 mr-2" />
                รายละเอียดสินค้า
              </button>
              <button
                type="button"
                className={`auction-tab-button ${activeTab === 'info' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <Tag className="w-4 h-4 mr-2" />
                ข้อมูลการประมูล
              </button>
            </div>

            <div className="auction-tabs-body">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">คำอธิบายสินค้า</h3>
                    {auction.description ? (
                      <p className="text-gray-700 leading-relaxed">{auction.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">ผู้ขายไม่ได้ให้คำอธิบายสินค้า</p>
                    )}
                  </section>

                  <section className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">ผู้ขาย</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">
                          {auction.owner_username || 'ไม่ระบุ'}
                        </p>
                        <Link
                          to={`/sellers/${auction.user_id}/reviews`}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
                          title="ดูรีวิวผู้ขายทั้งหมด"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                          <span className="font-semibold text-gray-900">
                            {Number(auction.owner_average_rating || 0).toFixed(1)}
                          </span>
                          <span className="text-gray-400">({Number(auction.owner_review_count || 0)} รีวิว)</span>
                        </Link>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>เวลาสิ้นสุด</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(auction.end_time).toLocaleString()}
                      </p>
                    </section>

                    <section className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <Circle className="w-3.5 h-3.5 text-gray-400" />
                        <span>สถานะการประมูล</span>
                      </div>
                      <p className="text-sm font-semibold">
                        {ended ? (
                          <span className="text-red-600">สิ้นสุดแล้ว</span>
                        ) : (
                          <span className="text-emerald-600">กำลังเปิดประมูล</span>
                        )}
                      </p>
                    </section>

                    <section className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span>ราคาเริ่มต้น</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtMoney(auction.start_price)}
                      </p>
                    </section>

                    {auction.bid_type === 'increment' && auction.minimum_increment && (
                      <section className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          <span>บิดขั้นต่ำ</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {fmtMoney(auction.minimum_increment)}
                        </p>
                      </section>
                    )}

                    {auction.buy_now_price && (
                      <section className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <Zap className="w-3.5 h-3.5 text-gray-400" />
                          <span>ราคาซื้อทันที</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {fmtMoney(auction.buy_now_price)}
                        </p>
                      </section>
                    )}
                  </div>

                  {ended && winnerInfo && (
                    <section className="mt-2 rounded-xl bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">ผู้ชนะการประมูล</p>
                      <p className="text-sm font-bold text-emerald-900">{winnerInfo.username}</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        ราคาที่ชนะ: {fmtMoney(winnerInfo.amount)}
                      </p>
                      {winnerInfo.isCurrentUser && (
                        <p className="text-xs font-semibold text-emerald-700 mt-1">
                          คุณคือผู้ชนะการประมูลนี้
                        </p>
                      )}
                    </section>
                  )}
                </div>
              )}

              {false && (
                <div className="space-y-6">
                  {auction.bid_type === 'increment' ? (
                    <>
                      {topBidders.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">Top 5 Bidders</h3>
                          <div className="space-y-2">
                            {topBidders.map((bidder, index) => (
                              <div key={bidder.username} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium text-sm">#{index + 1} {bidder.username}</span>
                                <span className="font-bold text-primary text-sm">{fmtMoney(bidder.top_amount)}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <section>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Recent Bids</h3>
                        <div className="max-h-64 overflow-y-auto rounded-xl bg-white/50">
                          {bidsForHistory.length > 0 ? (
                            bidsForHistory.map((bid, index) => {
                              const isHighest = highestBidAmount !== null && Number(bid.amount) === highestBidAmount;
                              const displayName = maskBidUsername(bid.username, index);
                              return (
                                <div
                                  key={bid.id}
                                  className="flex items-center justify-between px-3 py-3.5 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {displayName}
                                      </span>
                                      {isHighest && (
                                        <span className="inline-flex items-center rounded-full bg-amber-900 text-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                          Highest
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400 mt-0.5">
                                      {new Date(bid.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {fmtMoney(bid.amount)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-6 text-center text-sm text-gray-400">
                              ยังไม่มีผู้เสนอราคาในขณะนี้
                            </div>
                          )}
                        </div>
                      </section>
                    </>
                  ) : (
                    <>
                      {auction.user_id !== user?.id && (
                        <section>
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">Sealed bidding information</h3>
                          <div className="space-y-3 text-sm text-gray-700">
                            <p>การบิดจะถูกเก็บเป็นความลับจนกว่าการประมูลจะสิ้นสุดลง</p>
                            <p>แต่ละผู้ใช้สามารถส่งบิดได้เพียงครั้งเดียวในแต่ละการประมูล</p>
                            <p>ผู้ที่บิดสูงสุดจะเป็นผู้ชนะเมื่อสิ้นสุดการประมูล</p>
                          </div>
                        </section>
                      )}

                      {auction.user_id === user?.id && ownerBids.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">ประวัติการบิด (มองเห็นเฉพาะผู้ขาย)</h3>
                          <div className="max-h-64 overflow-y-auto rounded-xl bg-white/60">
                            {ownerBids.map((bid) => (
                              <div
                                key={bid.id}
                                className="flex items-center justify-between px-3 py-3.5 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">
                                    {bid.username}
                                  </span>
                                  <span className="text-xs text-gray-400 mt-0.5">
                                    {new Date(bid.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {fmtMoney(bid.amount)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  )}

                  {ended && isWinner && (
                    <section className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-1 text-sm">คุณคือผู้ชนะ!</h4>
                        <p className="text-xs text-green-700">
                          คุณชนะการประมูลนี้ด้วยราคา {fmtMoney(auction.current_price)}
                        </p>
                      </div>

                      {!hasPaymentTransaction ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2 text-sm">ขั้นตอนถัดไป</h4>
                          <p className="text-xs text-blue-700 mb-3">
                            สร้างรายการการชำระเงินเพื่อดำเนินการซื้อให้เสร็จสมบูรณ์
                          </p>
                          <button
                            onClick={handleCreatePayment}
                            className="btn btn-primary btn-sm"
                          >
                            Create payment transaction
                          </button>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2 text-sm">สร้างรายการชำระเงินแล้ว</h4>
                          <p className="text-xs text-green-700 mb-3">
                            คุณสามารถไปที่หน้าการชำระเงินเพื่อดำเนินการต่อได้ทันที
                          </p>
                          <a
                            href="/payments"
                            className="btn btn-success btn-sm"
                          >
                            ไปที่หน้าชำระเงิน
                          </a>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Now Confirmation Modal */}
      {buyNowModalOpen && auction && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">ยืนยันการซื้อ (Confirm Purchase)</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBuyNowModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  คุณต้องการซื้อสินค้านี้ทันทีในราคา{' '}
                  <span className="font-semibold">
                    {fmtMoney(auction.buy_now_price)}
                  </span>{' '}
                  หรือไม่?
                </p>
                {userBalance !== null && (
                  <>
                    <p>
                      ยอดเงินปัจจุบันของคุณ:{' '}
                      <span className="font-semibold">
                        {fmtMoney(userBalance)}
                      </span>
                    </p>
                    <p>
                      ยอดเงินหลังซื้อ:{' '}
                      <span className="font-semibold">
                        {fmtMoney(Number(userBalance) - Number(auction.buy_now_price))}
                      </span>
                    </p>
                  </>
                )}
                {userBalance === null && (
                  <p className="text-xs text-gray-500">
                    กำลังตรวจสอบยอดเงินของคุณ...
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBuyNowModalOpen(false)}
                disabled={buyNowLoading}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-bid-primary"
                onClick={handleBuyNowConfirm}
                disabled={buyNowLoading}
              >
                {buyNowLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการซื้อ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Confirmation Modal */}
      {bidModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">ยืนยันการบิด (Confirm Bid)</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBidModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  คุณต้องการบิดจำนวน{' '}
                  <span className="font-semibold">
                    {fmtMoney(bid || 0)}
                  </span>{' '}
                  สำหรับการประมูลนี้หรือไม่?
                </p>
                {auction.bid_type === 'sealed' && (
                  <p className="text-xs text-gray-500">
                    การบิดเป็นแบบ Sealed bidding ระบบจะไม่เปิดเผยราคาให้ผู้ใช้คนอื่นเห็นจนกว่าการประมูลจะสิ้นสุดลง
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBidModalOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-bid-primary"
                onClick={placeBid}
              >
                ยืนยันการบิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid History Modal */}
      {bidHistoryOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">ประวัติการบิด</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBidHistoryOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {auction?.bid_type === 'sealed' && auction?.user_id !== user?.id ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                  <div className="font-semibold mb-1">ไม่สามารถดูประวัติการบิดได้</div>
                  <div className="text-amber-800">
                    เนื่องจากการประมูลนี้เป็นแบบ <strong>Sealed bidding (บิดแบบปิด)</strong> ระบบจะซ่อนรายการบิดเพื่อความยุติธรรม
                    และจะแสดงเฉพาะผู้ขาย/เจ้าของการประมูลเท่านั้น
                  </div>
                </div>
              ) : auction?.bid_type === 'sealed' && auction?.user_id === user?.id ? (
                ownerBids?.length ? (
                  <div className="max-h-[60vh] overflow-y-auto rounded-xl bg-white/50">
                    <div className="grid grid-cols-3 gap-3 px-3 py-2 text-xs font-semibold text-gray-500">
                      <div>ผู้บิด</div>
                      <div className="text-right">จำนวนเงิน</div>
                      <div className="text-right">วันเวลา</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {[...ownerBids]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((b) => (
                          <div
                            key={b.id || `${b.user_id}-${b.created_at}-${b.amount}`}
                            className="grid grid-cols-3 gap-3 items-center px-3 py-3"
                          >
                            <div className="text-sm font-medium text-gray-900 truncate">{b.username || '—'}</div>
                            <div className="text-right text-sm font-semibold text-gray-900">{fmtMoney(b.amount)}</div>
                            <div className="text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                              {formatBidDateTime(b.created_at)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">ยังไม่มีผู้เสนอราคา</div>
                )
              ) : bidsForHistory.length === 0 ? (
                <div className="text-sm text-gray-600">ยังไม่มีผู้เสนอราคา</div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto rounded-xl bg-white/50">
                  <div className="grid grid-cols-2 gap-3 px-3 py-2 text-xs font-semibold text-gray-500">
                    <div>จำนวนเงินบิด</div>
                    <div className="text-right">วันเวลา</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[...bidsForHistory]
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((b) => {
                        const isHighest = highestBidAmount !== null && Number(b.amount) === highestBidAmount;
                        return (
                          <div
                            key={b.id || `${b.user_id}-${b.created_at}-${b.amount}`}
                            className="flex items-center justify-between gap-4 px-3 py-3"
                          >
                            <div className="min-w-0">
                              <div className={`font-semibold ${isHighest ? 'text-primary-700' : 'text-gray-900'}`}>
                                {fmtMoney(b.amount)}
                              </div>
                            </div>
                            <div className="text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                              {formatBidDateTime(b.created_at)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setBidHistoryOpen(false)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auction End Result Overlay (winner/loser) */}
      {endOverlay && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setEndOverlay(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">ผลการประมูล</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEndOverlay(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                className="flex items-center justify-center text-center"
                style={{ minHeight: 180 }}
              >
                <p
                  className={`text-2xl font-semibold ${
                    endOverlay.kind === 'won' ? 'text-emerald-800' : 'text-gray-800'
                  }`}
                >
                  {endOverlay.text}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEndOverlay(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}