import { Link } from 'react-router-dom';
import { Clock3 } from 'lucide-react';

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

export default function AuctionCard({ auction }) {
  const imageSrc = (() => {
    const firstImage = Array.isArray(auction.images) && auction.images.length
      ? auction.images[0]
      : auction.image;
    if (!firstImage) return '';
    if (firstImage.startsWith('http')) return firstImage;
    // When API returns "/uploads/xyz.jpg", prefix backend origin
    if (firstImage.startsWith('/')) return `${BACKEND_ORIGIN}${firstImage}`;
    return `${BACKEND_ORIGIN}/${firstImage}`;
  })();

  const isEnded = new Date(auction.end_time) <= new Date();
  const now = Date.now();
  const endTime = new Date(auction.end_time).getTime();
  const timeSinceEnd = now - endTime;
  const msRemaining = endTime - now;
  const thirtyMinutes = 30 * 60 * 1000;
  const justEnded = isEnded && timeSinceEnd <= thirtyMinutes;
  const isUrgent = !isEnded && msRemaining <= 24 * 60 * 60 * 1000; // เหลือน้อยกว่า 24 ชม.

  const formatRemainingShort = (ms) => {
    if (ms <= 0) return 'หมดเวลาแล้ว';
    const totalMinutes = Math.floor(ms / (60 * 1000));
    const totalHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      return `${days} วัน ${hours} ชม. ${minutes} นาที`;
    }
    if (totalHours >= 1) {
      return `${totalHours} ชม. ${minutes} นาที`;
    }
    return `${Math.max(totalMinutes, 1)} นาที`;
  };

  return (
    <div className="auction-card">
      {/* Image Section - fixed aspect to save vertical space */}
      {auction.image ? (
        <div className="auction-card-image">
          <img 
            src={imageSrc} 
            alt={auction.title}
            className="auction-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{ display: 'none' }} />
          
          {/* Status Badges Overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {auction.bid_type === 'sealed' && (
              <span className="badge badge-warning">Sealed</span>
            )}
            {justEnded && (
              <span className="badge badge-danger">Just Ended</span>
            )}
          </div>
        </div>
      ) : (
        <div className="auction-card-image auction-card-image--placeholder">
          <span className="text-sm text-gray-500">No image</span>
        </div>
      )}
      
      {/* Content Section - flex column, button pushed to bottom */}
      <div className="auction-content">
        {/* Title and Status */}
        <div className="auction-content-top">
          <h3 className="auction-title" title={auction.title}>{auction.title}</h3>
          
          {/* Time Status (only for ended state) */}
          <div className="auction-time mb-3">
            {isEnded && (
              justEnded ? (
                <span className="text-warning-600 bg-warning-50 px-3 py-1 rounded-full text-sm font-medium">
                  Just ended {Math.floor(timeSinceEnd / 60000)} minutes ago
                </span>
              ) : (
                <span className="text-error-600 bg-error-50 px-3 py-1 rounded-full text-sm font-medium">
                  Auction ended
                </span>
              )
            )}
          </div>
        </div>
        
        {/* Countdown - above Current Bid */}
        {!isEnded && (
          <div className="mb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isUrgent ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <span
                className={`inline-flex h-1.5 w-1.5 rounded-full animate-pulse ${
                  isUrgent ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
              <Clock3 className="w-3 h-3" />
              <span className="text-[11px] text-gray-700">
                ปิดประมูลใน:{' '}
                <span className="font-semibold text-gray-900">
                  {formatRemainingShort(msRemaining)}
                </span>
              </span>
            </div>
          </div>
        )}
        
        {/* Price Section */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Current Bid
          </div>
          <div className="auction-price">฿{Number(auction.current_price).toFixed(2)}</div>
          
          {auction.bid_type === 'increment' && auction.minimum_increment && (
            <div className="text-sm text-gray-600 mt-1">
              Min. increment: ฿{Number(auction.minimum_increment).toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Action - always at bottom of card */}
        <Link 
          to={`/auctions/${auction.id}`} 
          className="auction-link auction-link--primary auction-link--sticky"
        >
          {auction.bid_type === 'sealed' ? 'Submit Bid' : 'View & Bid'}
        </Link>
      </div>
    </div>
  );
}