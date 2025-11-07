import { Link } from 'react-router-dom';

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

export default function AuctionCard({ auction }) {
  const imageSrc = (() => {
    if (!auction.image) return '';
    if (auction.image.startsWith('http')) return auction.image;
    // When API returns "/uploads/xyz.jpg", prefix backend origin
    if (auction.image.startsWith('/')) return `${BACKEND_ORIGIN}${auction.image}`;
    return `${BACKEND_ORIGIN}/${auction.image}`;
  })();

  const isEnded = new Date(auction.end_time) <= new Date();
  const timeSinceEnd = new Date() - new Date(auction.end_time);
  const thirtyMinutes = 30 * 60 * 1000;
  const justEnded = isEnded && timeSinceEnd <= thirtyMinutes;

  return (
    <div className="auction-card">
      {/* Modern Image Section */}
      {auction.image ? (
        <div className="relative overflow-hidden">
          <img 
            src={imageSrc} 
            alt={auction.title}
            className="auction-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="absolute inset-0 bg-gray-100 flex items-center justify-center"
            style={{ display: 'none' }}
          >
            <span className="text-4xl text-gray-400">🖼️</span>
          </div>
          
          {/* Status Badges Overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {auction.bid_type === 'sealed' && (
              <span className="badge badge-warning">🔒 Sealed</span>
            )}
            {justEnded && (
              <span className="badge badge-danger">Just Ended</span>
            )}
          </div>
        </div>
      ) : (
        <div className="auction-image bg-gray-100 flex items-center justify-center">
          <span className="text-4xl text-gray-400">🖼️</span>
        </div>
      )}
      
      {/* Modern Content Section */}
      <div className="auction-content">
        {/* Title and Status */}
        <div className="mb-4">
          <h3 className="auction-title mb-2">{auction.title}</h3>
          
          {/* Time Status */}
          <div className="auction-time mb-3">
            {isEnded ? (
              justEnded ? (
                <span className="text-warning-600 bg-warning-50 px-3 py-1 rounded-full text-sm font-medium">
                  ⏰ Just ended {Math.floor(timeSinceEnd / 60000)} minutes ago
                </span>
              ) : (
                <span className="text-error-600 bg-error-50 px-3 py-1 rounded-full text-sm font-medium">
                  🏁 Auction ended
                </span>
              )
            ) : (
              <span className="text-success-600 bg-success-50 px-3 py-1 rounded-full text-sm font-medium">
                ⏰ Ends: {new Date(auction.end_time).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Price Section */}
        <div className="mb-4">
          <div className="auction-price">฿{Number(auction.current_price).toFixed(2)}</div>
          
          {auction.bid_type === 'increment' && auction.minimum_increment && (
            <div className="text-sm text-gray-600 mt-1">
              Min. increment: ฿{Number(auction.minimum_increment).toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link 
          to={`/auctions/${auction.id}`} 
          className="auction-link"
        >
          {auction.bid_type === 'sealed' ? 'Submit Bid' : 'View & Bid'}
        </Link>
      </div>
    </div>
  );
}