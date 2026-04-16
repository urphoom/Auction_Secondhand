import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

const MAX_IMAGES = 5;
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

function toSrc(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
  return `${BACKEND_ORIGIN}/${url}`;
}

export default function EditAuction() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [startPrice, setStartPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [endTime, setEndTime] = useState('');

  const [keepImages, setKeepImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // File[]
  const [newPreviews, setNewPreviews] = useState([]); // string[]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/auctions/${id}`);
        if (cancelled) return;
        setAuction(data);
        setStartPrice(String(data.start_price ?? ''));
        setBuyNowPrice(data.buy_now_price != null ? String(data.buy_now_price) : '');
        setEndTime(() => {
          // convert to local datetime-local
          const d = new Date(data.end_time);
          if (Number.isNaN(d.getTime())) return '';
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        });
        setKeepImages(Array.isArray(data.images) ? data.images : []);
        setError('');
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'ไม่สามารถโหลดข้อมูลการประมูลได้');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      newPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const bidCount = Number(auction?.bid_count ?? 0);
  const isEnded = auction ? new Date(auction.end_time) <= new Date() : false;
  const canEdit = user && auction && Number(auction.user_id) === Number(user.id) && bidCount === 0;

  const totalImagesCount = keepImages.length + newImages.length;

  const endTimeError = useMemo(() => {
    if (!endTime) return 'ต้องเลือกวันเวลาที่สิ้นสุด';
    const d = new Date(endTime);
    if (Number.isNaN(d.getTime())) return 'วันเวลาที่สิ้นสุดไม่ถูกต้อง';
    if (d <= new Date()) return 'เวลาใหม่ต้องมากกว่าเวลาปัจจุบัน';
    return '';
  }, [endTime]);

  if (authLoading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="loading">
                <div className="spinner" />
                <span>กำลังโหลด...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  const toggleKeepImage = (url) => {
    setKeepImages((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const onAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = Math.max(0, MAX_IMAGES - keepImages.length - newImages.length);
    const next = files.slice(0, room);
    const urls = next.map((f) => URL.createObjectURL(f));
    setNewImages((prev) => [...prev, ...next]);
    setNewPreviews((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const removeNewAt = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  const validate = () => {
    const sp = Number(startPrice);
    if (!Number.isFinite(sp) || sp <= 0) return 'ราคาเริ่มต้นต้องมากกว่า 0';
    if (buyNowPrice && String(buyNowPrice).trim() !== '') {
      const bn = Number(buyNowPrice);
      if (!Number.isFinite(bn) || bn <= 0) return 'ราคาซื้อทันทีต้องมากกว่า 0';
      if (bn <= sp) return 'ราคาซื้อทันทีต้องมากกว่าราคาเริ่มต้น';
    }
    if (endTimeError) return endTimeError;
    if (keepImages.length + newImages.length <= 0) return 'ต้องมีรูปสินค้าอย่างน้อย 1 รูป';
    if (keepImages.length + newImages.length > MAX_IMAGES) return `รูปได้ไม่เกิน ${MAX_IMAGES} รูป`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSaving(true);
      const form = new FormData();
      form.append('start_price', String(Number(startPrice)));
      form.append('end_time', new Date(endTime).toISOString());
      if (buyNowPrice && String(buyNowPrice).trim() !== '') {
        form.append('buy_now_price', String(Number(buyNowPrice)));
      } else {
        form.append('buy_now_price', '');
      }
      form.append('keep_images', JSON.stringify(keepImages));
      newImages.forEach((f) => form.append('images', f));

      await api.patch(`/auctions/${id}/edit`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('บันทึกการแก้ไขเรียบร้อยแล้ว');
      setTimeout(() => navigate(`/auctions/${id}`), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกการแก้ไขได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="loading">
                <div className="spinner" />
                <span>กำลังโหลด...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="container">
            <div className="alert alert-error">ไม่พบข้อมูลการประมูล</div>
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
            <h1 className="page-title">แก้ไขการประมูล</h1>
            <p className="page-subtitle">แก้ไขได้เฉพาะรายการที่ยังไม่มีผู้บิด (แม้จบเวลาแล้วสามารถยืดเวลาได้)</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {!canEdit && (
            <div className="alert alert-warning">
              {bidCount > 0
                ? `ไม่สามารถแก้ไขได้ เนื่องจากมีการบิดแล้ว (${bidCount} ครั้ง)`
                : 'ไม่สามารถแก้ไขได้ เนื่องจากคุณไม่ใช่เจ้าของการประมูลนี้'}
            </div>
          )}

          {error && <div className="alert alert-error mt-4">{error}</div>}
          {message && <div className="alert alert-success mt-4">{message}</div>}

          <div className="card mt-4">
            <div className="card-content">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="topup-section-title">ข้อมูลที่แก้ไขได้</h2>
                <Link to={`/auctions/${id}`} className="btn btn-secondary btn-sm">
                  กลับหน้ารายละเอียด
                </Link>
              </div>

              <form className="topup-form" onSubmit={handleSubmit}>
                <label className="topup-field">
                  <span>ราคาเริ่มต้น (บาท) *</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={startPrice}
                    onChange={(e) => setStartPrice(e.target.value)}
                    disabled={!canEdit || saving}
                  />
                </label>

                <label className="topup-field">
                  <span>ราคาซื้อทันที (ไม่บังคับ)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="เว้นว่างหากไม่ต้องการใช้"
                    disabled={!canEdit || saving}
                  />
                </label>

                <label className="topup-field">
                  <span>วันเวลาที่สิ้นสุด *</span>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!canEdit || saving}
                  />
                  {endTimeError && <small className="form-error">{endTimeError}</small>}
                </label>

                <div className="topup-field">
                  <span>รูปสินค้า (สูงสุด {MAX_IMAGES} รูป)</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">รูปเดิม</div>
                      {keepImages.length === 0 ? (
                        <div className="topup-upload">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={16} />
                            <span>ไม่มีรูปเดิมที่เลือกไว้</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {keepImages.map((url) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => toggleKeepImage(url)}
                              disabled={!canEdit || saving}
                              className="relative"
                              title="คลิกเพื่อลบออกจากรายการรูป"
                            >
                              <img
                                src={toSrc(url)}
                                alt="existing"
                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 border border-gray-200">
                                <Trash2 size={14} />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">เพิ่มรูปใหม่</div>
                      <div className="topup-upload">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={onAddFiles}
                          disabled={!canEdit || saving || totalImagesCount >= MAX_IMAGES}
                        />
                        <p className="flex items-center gap-2">
                          <Upload size={14} />
                          เหลืออีก {Math.max(0, MAX_IMAGES - totalImagesCount)} รูป
                        </p>
                      </div>
                      {newPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {newPreviews.map((src, idx) => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => removeNewAt(idx)}
                              disabled={!canEdit || saving}
                              className="relative"
                              title="คลิกเพื่อลบรูปใหม่"
                            >
                              <img src={src} alt="new" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 border border-gray-200">
                                <Trash2 size={14} />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="topup-actions">
                  <button type="submit" className="btn btn-primary" disabled={!canEdit || saving}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

