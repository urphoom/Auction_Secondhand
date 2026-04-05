import { Star } from 'lucide-react';

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const fillColor = '#F59E0B';
  const emptyStroke = '#D1D5DB';
  return (
    <div className="review-stars-row">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < v;
        return (
          <Star
            key={i}
            strokeWidth={1.5}
            size={16}
            style={
              filled
                ? { color: fillColor, fill: fillColor }
                : { color: emptyStroke, fill: 'transparent' }
            }
          />
        );
      })}
    </div>
  );
}

export default function ReviewList({ reviews = [], compact = false }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4 text-center">
        ยังไม่มีรีวิว
      </div>
    );
  }

  return (
    <div className={`divide-y divide-gray-100 ${compact ? '' : 'border border-gray-100 rounded-xl bg-white'}`}>
      {reviews.map((r) => (
        <div key={r.id || r.order_id} className={`${compact ? 'py-3' : 'p-4'} flex gap-4`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {r.buyer_username || 'ผู้ซื้อ'}
                </div>
                {r.auction_title && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {r.auction_title}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {r.created_at ? new Date(r.created_at).toLocaleString('th-TH') : ''}
              </div>
            </div>

            <div className="mt-2">
              <Stars value={r.rating} />
            </div>

            {r.comment && (
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {r.comment}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

