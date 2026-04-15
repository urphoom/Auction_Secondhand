import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const roleBadge = (role) => {
  if (role === 'admin') return 'admin-role-badge admin-role-badge--admin';
  return 'admin-role-badge';
};

const kindLabel = (kind) => {
  switch (kind) {
    case 'top_up':
      return 'เติมเงิน';
    case 'withdrawal':
      return 'ถอนเงิน';
    case 'auction':
      return 'ประมูล';
    case 'bid':
      return 'ประมูล';
    default:
      return kind || '—';
  }
};

const safeJsonParse = (value) => {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(n);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusTagVariant = (rawStatus) => {
  const s = String(rawStatus || '').trim();
  if (!s) return 'neutral';

  // Top up / withdrawal
  if (['pending'].includes(s)) return 'pending';
  if (['approved'].includes(s)) return 'approved';
  if (['rejected'].includes(s)) return 'rejected';

  // Auction/payment flow (Thai labels from backend)
  if (['รอชำระเงิน'].includes(s)) return 'pending';
  if (['ชำระเงินแล้ว'].includes(s)) return 'paid';
  if (['กำลังจัดส่ง'].includes(s)) return 'shipped';
  if (['ได้รับสินค้าแล้ว'].includes(s)) return 'delivered';
  if (['เสร็จสิ้น'].includes(s)) return 'completed';
  if (['ยกเลิก'].includes(s)) return 'cancelled';

  return 'neutral';
};

const activitySummary = (item) => {
  const kind = item?.kind;

  if (kind === 'top_up') {
    const adminPart = item?.admin_username ? ` · โดย ${item.admin_username}` : '';
    return `คำขอเติมเงิน #${item?.ref_id}${adminPart}`;
  }

  if (kind === 'withdrawal') {
    const adminPart = item?.admin_username ? ` · โดย ${item.admin_username}` : '';
    return `คำขอถอนเงิน #${item?.ref_id}${adminPart}`;
  }

  if (kind === 'auction') {
    return item?.title ? `สร้างการประมูล “${item.title}”` : `สร้างการประมูล #${item?.ref_id}`;
  }

  if (kind === 'bid') {
    return item?.title ? `เสนอราคาใน “${item.title}”` : `เสนอราคา #${item?.ref_id}`;
  }

  return item?.title || `#${item?.ref_id || ''}`;
};

const activityAmount = (item) => {
  if (!item) return '—';
  if (item.amount == null) return '—';
  return formatMoney(item.amount);
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [profileModal, setProfileModal] = useState(null); // { userId, loading, data, error }
  const [historyModal, setHistoryModal] = useState(null); // { userId, username, loading, items, error }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const openProfileModal = async (user) => {
    setProfileModal({ userId: user.id, loading: true, data: null, error: '' });
    try {
      const { data } = await api.get(`/admin/users/${user.id}/profile`);
      setProfileModal({ userId: user.id, loading: false, data, error: '' });
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setProfileModal({
        userId: user.id,
        loading: false,
        data: null,
        error: err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้'
      });
    }
  };

  const openHistoryModal = async (user) => {
    setHistoryModal({ userId: user.id, username: user.username, loading: true, items: [], error: '' });
    try {
      const { data } = await api.get(`/admin/users/${user.id}/activity?limit=30`);
      setHistoryModal({ userId: user.id, username: user.username, loading: false, items: Array.isArray(data) ? data : [], error: '' });
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setHistoryModal({
        userId: user.id,
        username: user.username,
        loading: false,
        items: [],
        error: err.response?.data?.message || 'ไม่สามารถโหลดประวัติได้'
      });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">จัดการผู้ใช้</h1>
        <p className="admin-page-subtitle">ค้นหาและตรวจสอบข้อมูลโปรไฟล์ รวมถึงดูประวัติการใช้งานของผู้ใช้</p>
      </div>

      <section className="admin-section">
        <div className="card">
          <div className="card-body admin-filters admin-filters--single">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อผู้ใช้..."
              className="form-input admin-filter-search"
            />
            <span className="admin-filter-summary">พบผู้ใช้ {filteredUsers.length} จากทั้งหมด {users.length}</span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="admin-state">
          <div className="loading">
            <div className="spinner" />
            <span>กำลังโหลดข้อมูลผู้ใช้...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <div>
            <p className="alert-title">ไม่สามารถโหลดข้อมูลได้</p>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty-state">ไม่พบผู้ใช้ที่ตรงกับคำค้นหา</div>
      ) : (
        <div className="card admin-table-card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ชื่อผู้ใช้</th>
                    <th>บทบาท</th>
                    <th>ยอดคงเหลือ</th>
                    <th className="admin-table-align-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-table-title">{user.username}</div>
                        <div className="admin-table-meta">ID: {user.id}</div>
                      </td>
                      <td>
                        <span className={roleBadge(user.role)}>{user.role}</span>
                      </td>
                      <td className="admin-table-strong">฿{Number(user.balance || 0).toFixed(2)}</td>
                      <td className="admin-table-align-right">
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            onClick={() => openProfileModal(user)}
                            className="btn btn-secondary btn-sm"
                          >
                            โปรไฟล์
                          </button>
                          <button
                            type="button"
                            onClick={() => openHistoryModal(user)}
                            className="btn btn-primary btn-sm"
                          >
                            ประวัติ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {profileModal && (
        <div className="admin-modal" role="dialog" aria-modal="true" onClick={() => setProfileModal(null)}>
          <div
            className="admin-modal__content"
            style={{ maxWidth: 720 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-modal__title">ข้อมูลโปรไฟล์ผู้ใช้</h2>
            {profileModal.loading ? (
              <div className="admin-state">
                <div className="loading">
                  <div className="spinner" />
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </div>
            ) : profileModal.error ? (
              <div className="alert alert-error">
                <p className="alert-text">{profileModal.error}</p>
              </div>
            ) : (
              <div className="admin-modal__body">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">ชื่อผู้ใช้</label>
                    <input className="form-input" disabled value={profileModal.data?.username || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">บทบาท</label>
                    <input className="form-input" disabled value={profileModal.data?.role || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เบอร์โทร</label>
                    <input className="form-input" disabled value={profileModal.data?.phone || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">อีเมล</label>
                    <input className="form-input" disabled value={profileModal.data?.email || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ยอดคงเหลือ</label>
                    <input
                      className="form-input"
                      disabled
                      value={`฿${Number(profileModal.data?.balance || 0).toFixed(2)}`}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เรตติ้ง</label>
                    <input
                      className="form-input"
                      disabled
                      value={`${Number(profileModal.data?.average_rating || 0).toFixed(2)} (${Number(profileModal.data?.review_count || 0)} รีวิว)`}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setProfileModal(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {historyModal && (
        <div className="admin-modal" role="dialog" aria-modal="true" onClick={() => setHistoryModal(null)}>
          <div
            className="admin-modal__content"
            style={{ maxWidth: 820 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-modal__title">ประวัติผู้ใช้</h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{historyModal.username}</strong> · แสดง {historyModal.items.length} รายการล่าสุด
            </p>

            {historyModal.loading ? (
              <div className="admin-state">
                <div className="loading">
                  <div className="spinner" />
                  <span>กำลังโหลดประวัติ...</span>
                </div>
              </div>
            ) : historyModal.error ? (
              <div className="alert alert-error">
                <p className="alert-text">{historyModal.error}</p>
              </div>
            ) : historyModal.items.length === 0 ? (
              <div className="admin-empty-state">ยังไม่มีประวัติ</div>
            ) : (
              <div className="table-responsive admin-history-scroll">
                <table className="admin-table admin-history-table">
                  <thead>
                    <tr>
                      <th className="admin-history-col-kind">ประเภท</th>
                      <th className="admin-history-col-detail">รายละเอียด</th>
                      <th className="admin-history-col-amount">จำนวนเงิน</th>
                      <th className="admin-history-col-status">สถานะ</th>
                      <th className="admin-history-col-time">เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyModal.items.map((item) => (
                      <tr key={`${item.kind}-${item.ref_id}`}>
                        <td className="admin-table-strong admin-history-kind admin-history-col-kind">{kindLabel(item.kind)}</td>
                        <td className="admin-history-col-detail">
                          <div className="admin-table-title admin-history-summary" title={activitySummary(item)}>
                            {activitySummary(item)}
                          </div>
                        </td>
                        <td className="admin-history-col-amount">{activityAmount(item)}</td>
                        <td className="admin-history-col-status">
                          {item.status ? (
                            <span className={`admin-status-tag admin-status-tag--${statusTagVariant(item.status)}`}>
                              {String(item.status).replaceAll('_', ' ')}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="admin-table-meta admin-history-col-time">
                          {formatDateTime(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setHistoryModal(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

