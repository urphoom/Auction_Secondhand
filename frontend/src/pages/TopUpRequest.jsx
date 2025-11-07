import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const statusMeta = {
  pending: { label: 'รอดำเนินการ', tagClass: 'admin-status-tag admin-status-tag--pending' },
  approved: { label: 'อนุมัติแล้ว', tagClass: 'admin-status-tag admin-status-tag--approved' },
  rejected: { label: 'ปฏิเสธ', tagClass: 'admin-status-tag admin-status-tag--rejected' }
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

  useEffect(() => {
    loadRequests();
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setListError('');
      const { data } = await api.get('/top-ups/me');
      setRequests(Array.isArray(data) ? data : []);
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
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">💸 เติมเงินเข้าบัญชี</h1>
            <p className="page-subtitle">อัปโหลดสลิปโอนเงินเพื่อแจ้งทีมงาน และติดตามสถานะคำขอในที่เดียว</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container topup-page">
          <div className="topup-grid">
            <div className="card topup-card">
              <div className="card-content">
                <h2 className="topup-section-title">ส่งคำขอเติมเงิน</h2>
                <p className="topup-section-subtitle">กรุณากรอกจำนวนเงินและอัปโหลดหลักฐานการโอน</p>

                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
                    <span>{message.text}</span>
                  </div>
                )}

                <form className="topup-form" onSubmit={handleSubmit}>
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

                  <label className="topup-field">
                    <span>หมายเหตุถึงทีมงาน (ไม่บังคับ)</span>
                    <textarea
                      rows="3"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="เพิ่มรายละเอียด เช่น ช่องทางการโอน เวลาที่โอน ฯลฯ"
                    />
                  </label>

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
                    {sortedRequests.map((request) => {
                      const status = statusMeta[request.status] || statusMeta.pending;
                      return (
                        <div key={request.id} className="topup-history-item">
                          <div className="topup-history-row">
                            <div>
                              <h3>คำขอ #{request.id}</h3>
                              <p className="topup-history-date">
                                ส่งเมื่อ {new Date(request.created_at).toLocaleString('th-TH')}
                              </p>
                            </div>
                            <span className={status.tagClass}>{status.label}</span>
                          </div>

                          <div className="topup-history-grid">
                            <div>
                              <span className="topup-history-label">จำนวนเงิน</span>
                              <p className="topup-history-value">฿{Number(request.amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="topup-history-label">สลิปโอนเงิน</span>
                              <div className="topup-history-image">
                                <img
                                  src={`${FILE_BASE_URL}${request.slip_url}`}
                                  alt={`สลิปคำขอ #${request.id}`}
                                  className="topup-thumbnail"
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
                                ดำเนินการโดย {request.processed_by_username} เมื่อ {new Date(request.processed_at).toLocaleString('th-TH')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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


