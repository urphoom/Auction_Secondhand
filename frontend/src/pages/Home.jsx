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
              <h1 className="page-title">Auction House</h1>
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
            <h1 className="page-title home-hero-title">Auction House</h1>
            <p className="page-subtitle home-hero-subtitle">
              แกลเลอรีการประมูลในสไตล์มินิมอลสำหรับสินค้าที่คัดสรรมาแล้ว
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Modern Auction Summary Dashboard */}
          {currentUser && auctions.length > 0 && (
            <div className="mb-8">
              <div className="card">
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">ภาพรวมการประมูล</h3>
                        <p className="text-primary-600 font-semibold">{auctions.length} รายการ</p>
                      </div>
                    </div>
                    
                    
                    
                    
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Active Auctions Section */}
          <div className="home-auction-section">
            <div className="home-auction-section-header">
              <h2 className="home-auction-section-title">การประมูลที่กำลังดำเนิน</h2>
              <p className="home-auction-section-desc">
                เรียกดูสินค้าที่ถูกคัดเลือกอย่างพิถีพิถันและเริ่มการประมูลอย่างมั่นใจ
              </p>
            </div>

            {error && <div className="alert alert-error mb-6">{error}</div>}

            {auctions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl"></span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีการประมูลที่กำลังดำเนิน</h3>
                <p className="text-gray-600 mb-6">
                  ขณะนี้ยังไม่มีการประมูลที่กำลังดำเนินอยู่ กรุณาติดตามโอกาสใหม่ๆ ในภายหลัง!
                </p>
                {currentUser && currentUser.role !== 'admin' && (
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
        </div>
      </div>
    </div>
  );
}