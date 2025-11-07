import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const statuses = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ปฏิเสธ' }
];

const statusMeta = {
  pending: { label: 'รอดำเนินการ', tagClass: 'admin-status-tag admin-status-tag--pending' },
  approved: { label: 'อนุมัติแล้ว', tagClass: 'admin-status-tag admin-status-tag--approved' },
  rejected: { label: 'ปฏิเสธ', tagClass: 'admin-status-tag admin-status-tag--rejected' }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export default function AdminTopUps() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const { data } = await api.get(`/admin/top-ups${query}`);
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch top up requests:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดคำขอเติมเงินได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const visibleRequests = useMemo(() => requests, [requests]);

  const submitAction = async (event) => {
    event.preventDefault();
    if (!actionModal) return;

    setProcessingId(actionModal.request.id);
    try {
      await api.post(`/admin/top-ups/${actionModal.request.id}/${actionModal.action}`, {
        note: actionModal.note.trim() || undefined
      });
      setActionModal(null);
      await loadRequests();
    } catch (err) {
      console.error(`Failed to ${actionModal.action} top up`, err);
      alert(err.response?.data?.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">คำขอเติมเงิน</h1>
        <p className="admin-page-subtitle">ตรวจสอบหลักฐานอนุมัติ/ปฏิเสธคำขอ พร้อมบันทึกหมายเหตุประกอบการตัดสินใจ</p>
      </div>

      <section className="admin-section">
        <div className="card">
          <div className="card-body admin-filters admin-filters--wrap">
            <div className="admin-filter-tabs">
              {statuses.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`admin-filter-tab ${filter === item.value ? 'is-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={loadRequests} className="btn btn-secondary btn-sm">
              รีเฟรช
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="admin-state">
          <div className="loading">
            <div className="spinner" />
            <span>กำลังโหลดคำขอเติมเงิน...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div>
            <p className="alert-title">ไม่สามารถโหลดคำขอได้</p>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="admin-empty-state">ไม่มีคำขอในสถานะนี้</div>
      ) : (
        <div className="admin-request-list">
          {visibleRequests.map((request) => (
            <div key={request.id} className="card admin-request-card">
              <div className="card-body">
                <div className="admin-request-card__header">
                  <div>
                    <h3>{request.user_username}</h3>
                    <p>ส่งเมื่อ {new Date(request.created_at).toLocaleString('th-TH')}</p>
                    {request.note && <p className="admin-request-note">หมายเหตุผู้ใช้: {request.note}</p>}
                    {request.processed_by_username && (
                      <p className="admin-request-note">
                        ดำเนินการโดย {request.processed_by_username}{' '}
                        {request.processed_at ? `เมื่อ ${new Date(request.processed_at).toLocaleString('th-TH')}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="admin-request-card__meta">
                    <span className="admin-meta-value admin-meta-value--emerald">
                      {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(request.amount || 0))}
                    </span>
                    <span className={statusMeta[request.status]?.tagClass ?? 'admin-status-tag'}>
                      {statusMeta[request.status]?.label ?? request.status}
                    </span>
                    {request.slip_url && (
                      <div className="admin-slip-preview">
                        <img
                          src={`${FILE_BASE_URL}${request.slip_url}`}
                          alt={`สลิปคำขอ #${request.id}`}
                          className="topup-thumbnail"
                        />
                        <a
                          href={`${FILE_BASE_URL}${request.slip_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-link"
                        >
                          📎 เปิดดูสลีปขนาดเต็ม
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="admin-request-card__actions">
                    <button
                      type="button"
                      onClick={() => setActionModal({ request, action: 'approve', note: '' })}
                      disabled={processingId === request.id}
                      className="btn btn-success btn-sm"
                    >
                      {processingId === request.id ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionModal({ request, action: 'reject', note: '' })}
                      disabled={processingId === request.id}
                      className="btn btn-danger btn-sm"
                    >
                      {processingId === request.id ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {actionModal && (
        <div className="admin-modal">
          <form onSubmit={submitAction} className="admin-modal__content admin-modal__content--sm">
            <h2 className="admin-modal__title">
              {actionModal.action === 'approve' ? 'อนุมัติคำขอเติมเงิน' : 'ปฏิเสธคำขอเติมเงิน'}
            </h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{actionModal.request.user_username}</strong> · ยอดที่ร้องขอ:{' '}
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(actionModal.request.amount || 0))}
            </p>
            <label className="admin-field admin-field--full">
              <span>หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={(e) => setActionModal((prev) => ({ ...prev, note: e.target.value }))}
                className="form-textarea"
                placeholder="ระบุเหตุผลหรือข้อสังเกต"
              />
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActionModal(null)}>
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={processingId === actionModal.request.id}
              >
                {processingId === actionModal.request.id ? 'กำลังบันทึก...' : 'ยืนยันการดำเนินการ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

