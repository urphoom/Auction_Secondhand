import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '../services/api.js';

function StarPicker({ value, onChange, disabled }) {
  const v = Math.max(1, Math.min(5, Number(value) || 5));
  const [hover, setHover] = useState(null);
  const active = hover ?? v;
  const labels = {
    1: 'แย่มาก',
    2: 'พอใช้',
    3: 'ปานกลาง',
    4: 'ดีมาก',
    5: 'ยอดเยี่ยม'
  };

  return (
    <div>
      <div className="review-stars-row">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= active;
          const isHovering = hover !== null;
          const fillColor = isHovering ? '#FBBF24' : '#F59E0B';
          const emptyStroke = '#D1D5DB';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx)}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
              disabled={disabled}
              className="review-star-btn"
              aria-label={`${idx} stars`}
            >
              <Star
                size={28}
                strokeWidth={1.5}
                style={
                  filled
                    ? { color: fillColor, fill: fillColor }
                    : { color: emptyStroke, fill: 'transparent' }
                }
              />
            </button>
          );
        })}
        <span className="review-stars-label">
          {active}/5 • {labels[active] || ''}
        </span>
      </div>
      <div className="review-stars-hint">
        1 = แย่มาก • 5 = ยอดเยี่ยม
      </div>
    </div>
  );
}

export default function ReviewCreate() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [existing, setExisting] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canReview = useMemo(() => {
    if (!tx) return false;
    return tx.status === 'completed';
  }, [tx]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const txRes = await api.get(`/payments/transactions/${orderId}`);
        if (!mounted) return;
        setTx(txRes.data);

        // Existing review is optional; don't fail page if endpoint is unavailable
        try {
          const existingRes = await api.get(`/reviews/order/${orderId}`);
          if (!mounted) return;
          setExisting(existingRes.data);
        } catch (e2) {
          // If backend not restarted yet, this may 404. Treat as "no existing review".
          if (!mounted) return;
          setExisting(null);
        }
      } catch (e) {
        if (!mounted) return;
        const msg = e.response?.data?.message || e.message || 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canReview) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/reviews', {
        order_id: Number(orderId),
        rating,
        comment
      });
      // backend updates average_rating; notify navbar to refresh if needed
      if (data?.seller_average_rating !== undefined) {
        window.dispatchEvent(new CustomEvent('sellerRatingUpdated', { detail: data.seller_average_rating }));
      }
      navigate('/payments');
    } catch (e2) {
      setError(e2.response?.data?.message || 'ไม่สามารถส่งรีวิวได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">ให้คะแนนผู้ขาย</h1>
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
            <h1 className="page-title">ให้คะแนนผู้ขาย</h1>
            <p className="page-subtitle">รีวิวนี้จะทำได้เมื่อสถานะการชำระเงินเป็น completed เท่านั้น</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <div className="card">
              <div className="card-body">
                {tx && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-900">{tx.auction_title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ผู้ขาย: <span className="font-medium text-gray-900">{tx.seller_username}</span> • สถานะ: <span className="font-medium">{tx.status}</span>
                    </div>
                  </div>
                )}

                {existing ? (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">คุณได้รีวิวรายการนี้แล้ว</div>
                    <div className="text-sm text-gray-600 mt-1">คะแนน: {existing.rating} ดาว</div>
                    {existing.comment && <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{existing.comment}</div>}
                    <div className="mt-4">
                      <button type="button" className="btn btn-secondary" onClick={() => navigate('/payments')}>
                        กลับไปหน้า Payments
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">ให้คะแนน</div>
                      <StarPicker value={rating} onChange={setRating} disabled={submitting} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">ความคิดเห็น (ไม่บังคับ)</div>
                      <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="form-textarea"
                        placeholder="แชร์ประสบการณ์การซื้อขายเพื่อช่วยเพิ่มความน่าเชื่อถือ"
                        disabled={submitting}
                      />
                    </div>

                    {!canReview && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        ยังไม่สามารถรีวิวได้จนกว่าสถานะคำสั่งซื้อจะเป็น <strong>completed</strong>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/payments')} disabled={submitting}>
                        ยกเลิก
                      </button>
                      <button type="submit" className="btn btn-bid-primary flex-1" disabled={!canReview || submitting}>
                        {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

