import { useEffect, useState } from 'react';
import api from '../services/api.js';
import AuctionCard from '../components/AuctionCard.jsx';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuctions, setFilteredAuctions] = useState([]);

  useEffect(() => {
    async function loadAuctions() {
      try {
        setLoading(true);
        const { data } = await api.get('/auctions');
        setAuctions(data);
      } catch (error) {
        console.error('Failed to load auctions:', error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    }
    loadAuctions();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAuctions(auctions);
    } else {
      const filtered = auctions.filter(auction => 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auction.description && auction.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAuctions(filtered);
    }
  }, [auctions, searchTerm]);

  // Filter auctions based on end time
  const filterAuctions = (auctionList) => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    return auctionList.filter(auction => {
      const endTime = new Date(auction.end_time);
      // Show auctions that are still active OR ended within the last 30 minutes
      return endTime > thirtyMinutesAgo;
    });
  };

  const displayAuctions = filterAuctions(filteredAuctions);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">🏆 Browse Auctions</h1>
              <p className="page-subtitle">Discover amazing items up for auction</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-screen">
              <div className="loading">
                <div className="spinner"></div>
                <span>Loading auctions...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="container">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-2">🏆 เรียกดูการประมูล</h1>
            <p className="text-muted">ค้นพบสินค้าที่น่าสนใจที่กำลังประมูล</p>
            
            {/* Platform Fee Notice */}
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-blue-600">💰</span>
                  <span className="text-sm font-medium text-blue-800">ค่าธรรมเนียมเว็บไซต์: 5%</span>
                </div>
                <p className="text-xs text-blue-700">
                  เงินจะถูกโอนเข้าบัญชีผู้ขายหลังจากผู้ซื้อยืนยันการรับสินค้าแล้ว
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">🔍 ค้นหาการประมูล</label>
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อหรือคำอธิบาย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
                <div className="form-help">
                  {searchTerm ? `พบ ${displayAuctions.length} การประมูล` : `แสดง ${displayAuctions.length} การประมูล`}
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Grid */}
          {displayAuctions.length > 0 ? (
            <div className="auction-grid">
              {displayAuctions.map(auction => {
                const endTime = new Date(auction.end_time);
                const now = new Date();
                const isEnded = endTime <= now;
                const timeSinceEnd = now - endTime;
                const thirtyMinutes = 30 * 60 * 1000;
                const justEnded = isEnded && timeSinceEnd <= thirtyMinutes;

                // Handle image URL properly
                const imageSrc = (() => {
                  if (!auction.image) return '';
                  if (auction.image.startsWith('http')) return auction.image;
                  if (auction.image.startsWith('/')) return `http://localhost:4000${auction.image}`;
                  return `http://localhost:4000/${auction.image}`;
                })();

                return (
                  <div key={auction.id} className="auction-card">
                    {auction.image ? (
                      <img 
                        src={imageSrc} 
                        alt={auction.title}
                        className="auction-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="auction-image flex items-center justify-center bg-gray-100 text-gray-500">
                        🖼️ No Image
                      </div>
                    )}
                    
                    <div className="auction-content">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="auction-title">{auction.title}</h3>
                        <div className="flex gap-1">
                          {auction.bid_type === 'sealed' && (
                            <span className="badge badge-warning">ปิดผนึก</span>
                          )}
                          {justEnded && (
                            <span className="badgeeiei badgeeiei-danger">เพิ่งจบใหม่</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="auction-price">฿{Number(auction.current_price).toFixed(2)}</div>
                      
                      {auction.bid_type === 'increment' && auction.minimum_increment && (
                        <div className="text-sm text-muted mb-2">
                          เพิ่มขั้นต่ำ: ฿{Number(auction.minimum_increment).toFixed(2)}
                        </div>
                      )}
                      
                      <div className="auction-time mb-3">
                        {isEnded ? (
                          justEnded ? (
                            <span className="text-warning">⏰ เพิ่งจบเมื่อ {Math.floor(timeSinceEnd / 60000)} นาทีที่แล้ว</span>
                          ) : (
                            <span className="text-danger">🏁 การประมูลจบแล้ว</span>
                          )
                        ) : (
                          <span className="text-success">⏰ จบเมื่อ: {endTime.toLocaleString()}</span>
                        )}
                      </div>
                      
                      <a 
                        href={`/auctions/${auction.id}`} 
                        className="auction-link"
                      >
                        {auction.bid_type === 'sealed' ? 'เสนอราคา' : 'ดูและเสนอราคา'}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">ไม่พบการประมูล</div>
              <div className="empty-description">
                {searchTerm 
                  ? `ไม่มีการประมูลที่ตรงกับการค้นหา "${searchTerm}"`
                  : 'ไม่มีการประมูลที่พร้อมใช้งานในขณะนี้'
                }
              </div>
              {searchTerm && (
                <div className="mt-4">
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="btn btn-primary"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}