import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const statuses = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอตรวจสอบ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ปฏิเสธ' }
];

const statusMeta = {
  pending: { label: 'รอตรวจสอบ', tagClass: 'admin-status-tag admin-status-tag--pending' },
  approved: { label: 'อนุมัติแล้ว', tagClass: 'admin-status-tag admin-status-tag--approved' },
  rejected: { label: 'ปฏิเสธ', tagClass: 'admin-status-tag admin-status-tag--rejected' }
};

const actionLabels = {
  created: 'ผู้ใช้ส่งคำขอ',
  approved: 'แอดมินอนุมัติ',
  rejected: 'แอดมินปฏิเสธ'
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const [actionModal, setActionModal] = useState(null); // { request, action, note, slipFile }
  const [logsModal, setLogsModal] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logs, setLogs] = useState([]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize, search: searchValue || undefined };
      if (filter !== 'all') params.status = filter;
      const { data } = await api.get('/admin/withdrawals', { params });
      setRequests(data?.data || []);
      const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch withdrawal requests:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดคำขอถอนเงินได้');
      setRequests([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, searchValue, pageSize]);

  const visibleRequests = useMemo(() => requests, [requests]);

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchValue(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchValue('');
    setPage(1);
  };

  const openLogsModal = async (request) => {
    setLogsModal(request);
    setLogs([]);
    setLogsError('');
    setLogsLoading(true);
    try {
      const { data } = await api.get(`/admin/withdrawals/${request.id}/logs`);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load withdrawal logs:', err);
      setLogsError(err.response?.data?.message || 'ไม่สามารถโหลดประวัติคำขอได้');
    } finally {
      setLogsLoading(false);
    }
  };

  const submitReject = async (event) => {
    event.preventDefault();
    if (!actionModal) return;
    setProcessingId(actionModal.request.id);
    try {
      await api.post(`/admin/withdrawals/${actionModal.request.id}/reject`, {
        note: actionModal.note.trim() || undefined
      });
      setActionModal(null);
      await loadRequests();
    } catch (err) {
      console.error('Failed to reject withdrawal', err);
      alert(err.response?.data?.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setProcessingId(null);
    }
  };

  const submitApprove = async (event) => {
    event.preventDefault();
    if (!actionModal) return;
    if (!actionModal.slipFile) {
      alert('กรุณาแนบสลิปหลักฐานการโอน');
      return;
    }
    setProcessingId(actionModal.request.id);
    try {
      const form = new FormData();
      form.append('slip', actionModal.slipFile);
      if (actionModal.note.trim()) form.append('note', actionModal.note.trim());
      await api.post(`/admin/withdrawals/${actionModal.request.id}/approve`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActionModal(null);
      await loadRequests();
    } catch (err) {
      console.error('Failed to approve withdrawal', err);
      alert(err.response?.data?.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">คำขอถอนเงิน</h1>
        <p className="admin-page-subtitle">ตรวจสอบคำขอถอนเงิน แนบสลิป และอนุมัติ/ปฏิเสธคำขอ</p>
      </div>

      <section className="admin-section">
        <div className="card">
          <div className="card-body admin-filters admin-filters--wrap">
            <div className="admin-filter-tabs">
              {statuses.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleFilterChange(item.value)}
                  className={`admin-filter-tab ${filter === item.value ? 'is-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form className="admin-search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="ค้นหา ID หรือชื่อผู้ใช้"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-input"
              />
              <div className="admin-search-actions">
                <button type="submit" className="btn btn-secondary btn-sm">
                  ค้นหา
                </button>
                {searchValue && (
                  <button type="button" className="btn btn-sm" onClick={handleClearSearch}>
                    ล้าง
                  </button>
                )}
              </div>
            </form>
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
            <span>กำลังโหลดคำขอถอนเงิน...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <div>
            <p className="alert-title">ไม่สามารถโหลดคำขอได้</p>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="admin-empty-state">ไม่มีคำขอในสถานะนี้</div>
      ) : (
        <>
          <div className="admin-request-summary">
            คำขอทั้งหมด {totalItems} รายการ · แสดงต่อหน้า
            <select value={pageSize} onChange={handlePageSizeChange} className="admin-page-size-select">
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-request-list">
            {visibleRequests.map((request) => (
              <div key={request.id} className="card admin-request-card">
                <div className="card-body">
                  <div className="admin-request-card__header">
                    <div>
                      <h3>{request.user_username}</h3>
                      <p>ส่งเมื่อ {new Date(request.created_at).toLocaleString('th-TH')}</p>
                      <p className="admin-request-note">
                        บัญชี: {request.bank_name} · {request.account_number}
                      </p>
                      <p className="admin-request-note">
                        ถอน: ฿{Number(request.amount || 0).toFixed(2)} · ค่าธรรมเนียม ฿{Number(request.fee || 0).toFixed(2)} · สุทธิ ฿
                        {Number(request.payout_amount || 0).toFixed(2)}
                      </p>
                      {request.note && <p className="admin-request-note">หมายเหตุ: {request.note}</p>}
                      {request.processed_by_username && (
                        <p className="admin-request-note">
                          ดำเนินการโดย {request.processed_by_username}{' '}
                          {request.processed_at ? `เมื่อ ${new Date(request.processed_at).toLocaleString('th-TH')}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="admin-request-card__meta">
                      <span className={statusMeta[request.status]?.tagClass ?? 'admin-status-tag'}>
                        {statusMeta[request.status]?.label ?? request.status}
                      </span>
                      {request.slip_url && (
                        <div className="admin-slip-preview">
                          <img src={`${FILE_BASE_URL}${request.slip_url}`} alt={`สลิปถอนเงิน #${request.id}`} className="topup-thumbnail" />
                          <a
                            href={`${FILE_BASE_URL}${request.slip_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-link"
                          >
                            📎 เปิดดูสลิปขนาดเต็ม
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="admin-request-card__actions">
                      <button
                        type="button"
                        onClick={() => setActionModal({ request, action: 'approve', note: '', slipFile: null })}
                        disabled={processingId === request.id}
                        className="btn btn-success btn-sm"
                      >
                        {processingId === request.id ? 'กำลังอนุมัติ...' : 'อนุมัติ + แนบสลิป'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionModal({ request, action: 'reject', note: '', slipFile: null })}
                        disabled={processingId === request.id}
                        className="btn btn-danger btn-sm"
                      >
                        {processingId === request.id ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                      </button>
                    </div>
                  )}

                  <div className="admin-request-card__footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openLogsModal(request)}>
                      ดูประวัติคำขอ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                ← ก่อนหน้า
              </button>
              <span className="admin-pagination-info">
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
        </>
      )}

      {actionModal?.action === 'reject' && (
        <div className="admin-modal">
          <form onSubmit={submitReject} className="admin-modal__content admin-modal__content--sm">
            <h2 className="admin-modal__title">ปฏิเสธคำขอถอนเงิน</h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{actionModal.request.user_username}</strong> · ยอดถอน:{' '}
              ฿{Number(actionModal.request.amount || 0).toFixed(2)}
            </p>
            <label className="admin-field admin-field--full">
              <span>หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={(e) => setActionModal((prev) => ({ ...prev, note: e.target.value }))}
                className="form-textarea"
                placeholder="ระบุเหตุผล"
              />
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActionModal(null)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-danger btn-sm" disabled={processingId === actionModal.request.id}>
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </form>
        </div>
      )}

      {actionModal?.action === 'approve' && (
        <div className="admin-modal">
          <form onSubmit={submitApprove} className="admin-modal__content admin-modal__content--sm">
            <h2 className="admin-modal__title">อนุมัติคำขอถอนเงิน</h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{actionModal.request.user_username}</strong> · ยอดถอน:{' '}
              ฿{Number(actionModal.request.amount || 0).toFixed(2)} · สุทธิ ฿{Number(actionModal.request.payout_amount || 0).toFixed(2)}
            </p>
            <label className="admin-field admin-field--full">
              <span>แนบสลิปโอนเงิน *</span>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setActionModal((prev) => ({ ...prev, slipFile: e.target.files?.[0] || null }))}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={(e) => setActionModal((prev) => ({ ...prev, note: e.target.value }))}
                className="form-textarea"
                placeholder="เช่น โอนแล้วเวลา..."
              />
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActionModal(null)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-success btn-sm" disabled={processingId === actionModal.request.id}>
                ยืนยันการอนุมัติ
              </button>
            </div>
          </form>
        </div>
      )}

      {logsModal && (
        <div className="admin-modal">
          <div className="admin-modal__content admin-modal__content--sm">
            <h2 className="admin-modal__title">ประวัติคำขอ #{logsModal.id}</h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{logsModal.user_username}</strong>
            </p>
            <div className="admin-log-list">
              {logsLoading ? (
                <div className="admin-log-empty">
                  <div className="spinner" /> กำลังโหลดประวัติ...
                </div>
              ) : logsError ? (
                <div className="alert alert-error">
                  <span>{logsError}</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="admin-log-empty">ไม่มีประวัติคำขอ</div>
              ) : (
                logs.map((log) => {
                  let parsedDetails = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch {
                      parsedDetails = null;
                    }
                  }

                  return (
                    <div key={log.id} className="admin-log-item">
                      <div className="admin-log-time">{new Date(log.created_at).toLocaleString('th-TH')}</div>
                      <div className="admin-log-body">
                        <span className="admin-log-action">{actionLabels[log.action] || log.action}</span>
                        <span className="admin-log-actor">
                          {log.actor_type === 'admin'
                            ? `แอดมิน: ${log.actor_username || 'ไม่ทราบชื่อ'}`
                            : log.actor_type === 'user'
                            ? `ผู้ใช้: ${log.actor_username || 'ไม่ทราบชื่อ'}`
                            : 'ระบบ'}
                        </span>
                        {parsedDetails ? (
                          <div className="admin-log-details">
                            {parsedDetails.amount !== undefined && (
                              <div>
                                <strong>จำนวนเงิน:</strong> ฿{Number(parsedDetails.amount).toFixed(2)}
                              </div>
                            )}
                            {parsedDetails.fee !== undefined && (
                              <div>
                                <strong>ค่าธรรมเนียม:</strong> ฿{Number(parsedDetails.fee).toFixed(2)}
                              </div>
                            )}
                            {parsedDetails.payoutAmount !== undefined && (
                              <div>
                                <strong>สุทธิ:</strong> ฿{Number(parsedDetails.payoutAmount).toFixed(2)}
                              </div>
                            )}
                            {parsedDetails.note !== undefined && (
                              <div>
                                <strong>หมายเหตุ:</strong> {parsedDetails.note || '—'}
                              </div>
                            )}
                            {parsedDetails.slipUrl && (
                              <div>
                                <strong>สลิป:</strong>{' '}
                                <a href={`${FILE_BASE_URL}${parsedDetails.slipUrl}`} target="_blank" rel="noopener noreferrer" className="admin-link">
                                  เปิดดู
                                </a>
                              </div>
                            )}
                          </div>
                        ) : log.details ? (
                          <pre className="admin-log-details">{log.details}</pre>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLogsModal(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

