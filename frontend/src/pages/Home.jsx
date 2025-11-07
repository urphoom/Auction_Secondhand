import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import AuctionCard from '../components/AuctionCard.jsx';

export default function Home() {
  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) { 
          setUser(data); 
          setBalance(data.balance); 
        }
      } catch (e) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    async function loadActive() {
      try {
        const { data } = await api.get('/auctions/active');
        setAuctions(data);
      } catch (e) {
        setAuctions([]);
        setError('Failed to load auctions');
      }
    }
    loadActive();
  }, []);

  // countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prev) => {
        const now = Date.now();
        return prev
          .map(a => ({ ...a }))
          .filter(a => new Date(a.end_time).getTime() - now > 0);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatHHMMSS(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">🏠 Auction House</h1>
              <p className="page-subtitle">Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-screen">
              <div className="loading">
                <div className="spinner"></div>
                <span>Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  const currentUser = user;

  return (
    <div className="page">
      {/* Modern Hero Section */}
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">🏠 Auction House</h1>
            <p className="page-subtitle">ค้นพบการประมูลที่น่าสนใจและเสนอราคา</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Modern User Dashboard */}
          {currentUser && (
            <div className="mb-8">
              <div className="card">
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">ยินดีต้อนรับกลับ!</h3>
                        <p className="text-gray-600">{currentUser.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">ยอดเงินคงเหลือ</h3>
                        <p className="text-success-600 font-semibold">฿{Number(balance || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">การประมูลที่กำลังดำเนิน</h3>
                        <p className="text-warning-600 font-semibold">{auctions.length} รายการ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Platform Fee Notice */}
          {currentUser && (
            <div className="mb-8">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 mb-2">ข้อมูลค่าธรรมเนียม</h3>
                    <p className="text-primary-700">
                      เราเก็บค่าธรรมเนียม 5% จากทุกการประมูลที่สำเร็จ ซึ่งช่วยให้เราสามารถดูแลและพัฒนาบริการได้
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Active Auctions Section */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 การประมูลที่กำลังดำเนิน</h2>
              <p className="text-gray-600">เสนอราคาสินค้าที่น่าสนใจและคว้าของดีราคาถูก</p>
            </div>

            {error && (
              <div className="alert alert-error mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {auctions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl"></span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีการประมูลที่กำลังดำเนิน</h3>
                <p className="text-gray-600 mb-6">
                  ขณะนี้ยังไม่มีการประมูลที่กำลังดำเนินอยู่ กรุณาติดตามโอกาสใหม่ๆ ในภายหลัง!
                </p>
                {currentUser && (
                  <Link to="/add" className="btn btn-primary">
                    <span>➕</span>
                    <span>สร้างการประมูล</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="auction-grid">
                {auctions.map(auction => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </div>

          {/* Modern Support Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">💬 การสนับสนุนและชุมชน</h2>
              <p className="text-gray-600">รับความช่วยเหลือและเชื่อมต่อกับผู้ใช้คนอื่น</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="card-content">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎧</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">การสนับสนุน 24/7</h3>
                  <p className="text-gray-600 text-sm mb-4">ทีมสนับสนุนของเราพร้อมช่วยเหลือคุณตลอดเวลา</p>
                  {currentUser ? (
                    <Link to="/chat" className="btn btn-primary">
                      เข้าสู่แชท
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary">
                      เข้าสู่ระบบก่อน
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="card text-center">
                <div className="card-content">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ชุมชนผู้ใช้ User</h3>
                  <p className="text-gray-600 text-sm mb-4">เชื่อมต่อและแบ่งปันประสบการณ์กับผู้ใช้คนอื่น</p>
                  {currentUser ? (
                    <Link to="/chat" className="btn btn-secondary">
                      เข้าร่วมชุมชน
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-secondary">
                      เข้าสู่ระบบก่อน
                    </Link>
                  )}
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}