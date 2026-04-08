import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import api from '../services/api.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

/** แสดงเป็นรูปแบบ 08X-XXX-XXXX — ตัวเลขจริงสำหรับคัดลอกไม่มีขีด */
const PROMPTPAY_DISPLAY = '081-234-5678';
const PROMPTPAY_RAW = '0812345678';
const PROMPTPAY_ACCOUNT_NAME = 'AuctionHub Co., Ltd.';

const statusMeta = {
  pending: { label: 'กำลังตรวจสอบ', tagClass: 'topup-status topup-status--pending' },
  approved: { label: 'อนุมัติแล้ว', tagClass: 'topup-status topup-status--approved' },
  rejected: { label: 'ปฏิเสธ', tagClass: 'topup-status topup-status--rejected' }
};

export default function TopUpRequest() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [listError, setListError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    loadRequests();
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const copyPromptPay = async () => {
    try {
      await navigator.clipboard.writeText(PROMPTPAY_RAW);
      setToast('คัดลอกเลขพร้อมเพย์แล้ว');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 2200);
    } catch {
      setToast('ไม่สามารถคัดลอกได้');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 2200);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setListError('');
      const { data } = await api.get('/top-ups/me');
      setRequests(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (error) {
      console.error('Failed to load top-up requests:', error);
      setListError('ไม่สามารถโหลดประวัติคำขอเติมเงินได้');
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [requests]);

  const totalPages = Math.max(Math.ceil(sortedRequests.length / pageSize) || 1, 1);
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, page, pageSize]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (slipPreview) URL.revokeObjectURL(slipPreview);

    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    } else {
      setSlipFile(null);
      setSlipPreview('');
    }
  };

  const handlePageSizeChange = (event) => {
    const value = Number(event.target.value);
    setPageSize(value);
    setPage(1);
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setSlipFile(null);
    if (slipPreview) URL.revokeObjectURL(slipPreview);
    setSlipPreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกจำนวนเงินที่ต้องการเติม' });
      return;
    }

    if (!slipFile) {
      setMessage({ type: 'error', text: 'กรุณาอัปโหลดสลิปโอนเงิน' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', Number(amount).toFixed(2));
      if (note.trim()) formData.append('note', note.trim());
      formData.append('slip', slipFile);

      await api.post('/top-ups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ type: 'success', text: 'ส่งคำขอเติมเงินเรียบร้อยแล้ว กรุณารอแอดมินตรวจสอบ' });
      resetForm();
      await loadRequests();
    } catch (error) {
      console.error('Failed to submit top-up request:', error);
      const apiMessage = error.response?.data?.message;
      setMessage({ type: 'error', text: apiMessage || 'ไม่สามารถส่งคำขอเติมเงินได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page relative">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">เติมเงินเข้าบัญชี</h1>
            <p className="page-subtitle">
              โอนเงินผ่านพร้อมเพย์ตามยอดที่กรอก แล้วแนบสลิปเพื่อให้ทีมงานตรวจสอบ
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container topup-page">
          <div className="topup-grid">
            <div className="card topup-card">
              <div className="card-content">
                <h2 className="topup-section-title">ส่งคำขอเติมเงิน</h2>
                <p className="topup-section-subtitle">กรอกยอด → โอนตามเลขพร้อมเพย์ → แนบสลิป</p>

                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
                    <span>{message.text}</span>
                  </div>
                )}

                <form className="topup-form topup-form--compact" onSubmit={handleSubmit}>
                  <label className="topup-field">
                    <span>จำนวนเงินที่โอน (บาท)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="เช่น 500"
                    />
                  </label>

                  <div className="topup-payment-card rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      โอนเงินผ่านพร้อมเพย์
                    </p>
                    <p className="mb-2 text-sm font-bold leading-snug text-gray-900">{PROMPTPAY_ACCOUNT_NAME}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                        {PROMPTPAY_DISPLAY}
                      </span>
                      <button
                        type="button"
                        onClick={copyPromptPay}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
                        aria-label="คัดลอกเลขพร้อมเพย์"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        คัดลอก
                      </button>
                    </div>
                  </div>

                  <label className="topup-field">
                    <span>สลิปโอนเงิน</span>
                    <div className="topup-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <p>รองรับไฟล์รูปภาพ ขนาดไม่เกิน 5MB</p>
                    </div>
                    {slipPreview && (
                      <div className="topup-preview">
                        <img src={slipPreview} alt="ตัวอย่างสลิป" />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                          ลบไฟล์
                        </button>
                      </div>
                    )}
                  </label>

                  <label className="topup-field">
                    <span>หมายเหตุถึงทีมงาน (ไม่บังคับ)</span>
                    <textarea
                      rows="2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="เช่น เวลาที่โอน หรือรายละเอียดเพิ่มเติม"
                    />
                  </label>

                  <div className="topup-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเติมเงิน'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card topup-card">
              <div className="card-content">
                <h2 className="topup-section-title">ประวัติคำขอ</h2>
                <p className="topup-section-subtitle">ตรวจสอบสถานะการเติมเงินย้อนหลัง</p>

                {loadingRequests ? (
                  <div className="topup-loading">
                    <div className="spinner" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                ) : listError ? (
                  <div className="alert alert-error mt-4">
                    <span>{listError}</span>
                  </div>
                ) : sortedRequests.length === 0 ? (
                  <div className="topup-empty">
                    <p>ยังไม่มีคำขอเติมเงิน</p>
                    <span>เมื่อส่งคำขอแล้วจะสามารถติดตามสถานะได้ที่นี่</span>
                  </div>
                ) : (
                  <div className="topup-history">
                    <div className="topup-history-controls">
                      <span className="topup-summary">รวมทั้งหมด {sortedRequests.length} รายการ</span>
                      <div className="topup-page-size">
                        <label htmlFor="topup-page-size">แสดงต่อหน้า</label>
                        <select
                          id="topup-page-size"
                          value={pageSize}
                          onChange={handlePageSizeChange}
                        >
                          {[3, 5, 10, 20].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                {paginatedRequests.map((request) => {
                  const status = statusMeta[request.status] || statusMeta.pending;
                  return (
                    <div key={request.id} className="topup-history-card">
                      <div className="topup-history-header">
                        <div className="topup-history-title">
                          <h3>คำขอ #{request.id}</h3>
                          <p className="topup-history-date">
                            ส่งเมื่อ {new Date(request.created_at).toLocaleString('th-TH')}
                          </p>
                        </div>
                        <span className={`topup-history-status ${status.tagClass}`}>{status.label}</span>
                      </div>

                      <div className="topup-history-body">
                        <div>
                          <span className="topup-history-label">จำนวนเงิน</span>
                          <p className="topup-history-value">฿{Number(request.amount).toFixed(2)}</p>
                        </div>
                        <div className="topup-history-slip">
                          <span className="topup-history-label">สลิปโอนเงิน</span>
                          <img
                            src={`${FILE_BASE_URL}${request.slip_url}`}
                            alt={`สลิปคำขอ #${request.id}`}
                          />
                          <a
                            href={`${FILE_BASE_URL}${request.slip_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="topup-link"
                          >
                            เปิดดูขนาดเต็ม
                          </a>
                        </div>
                      </div>

                      {request.note && (
                        <div className="topup-history-note">
                          <span>{request.status === 'pending' ? 'หมายเหตุที่คุณแจ้ง' : 'หมายเหตุจากทีมงาน'}</span>
                          <p>{request.note}</p>
                        </div>
                      )}

                      {request.processed_by_username && request.processed_at && (
                        <div className="topup-history-processed">
                          <span>
                            ดำเนินการโดย {request.processed_by_username} เมื่อ{' '}
                            {new Date(request.processed_at).toLocaleString('th-TH')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                    {totalPages > 1 && (
                      <div className="topup-pagination">
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={page <= 1}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          ← ก่อนหน้า
                        </button>
                        <span className="topup-pagination-info">
                          หน้า {page} จาก {totalPages}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={page >= totalPages}
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          ถัดไป →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

