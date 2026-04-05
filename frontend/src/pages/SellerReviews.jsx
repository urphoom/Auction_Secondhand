import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import api from '../services/api.js';
import ReviewList from '../components/ReviewList.jsx';

function StarsSummary({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(v);
        return (
          <Star
            key={i}
            className={`w-4 h-4 ${filled ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

export default function SellerReviews() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const avg = useMemo(() => Number(seller?.average_rating || 0), [seller]);
  const count = useMemo(() => Number(seller?.review_count || 0), [seller]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/reviews/seller/${sellerId}/page`);
        if (!mounted) return;
        setSeller(data.seller);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.message || 'ไม่สามารถโหลดรีวิวผู้ขายได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [sellerId]);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">รีวิวผู้ขาย</h1>
              <p className="page-subtitle">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
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

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">รีวิวผู้ขาย</h1>
            <p className="page-subtitle">ดูความน่าเชื่อถือจากผู้ซื้อที่เคยทำรายการสำเร็จ</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4" />
                กลับหน้าแรก
              </Link>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {seller && (
              <div className="card mb-6">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm text-gray-500">ผู้ขาย</div>
                      <div className="text-lg font-semibold text-gray-900">{seller.username}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StarsSummary value={avg} />
                        <span className="text-sm font-semibold text-gray-900">{avg.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{count} รีวิว</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}

