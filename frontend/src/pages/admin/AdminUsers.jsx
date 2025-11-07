import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const roleBadge = (role) => {
  if (role === 'admin') return 'admin-role-badge admin-role-badge--admin';
  return 'admin-role-badge';
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);

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

  const openAdjustModal = (user, type) => {
    setAdjustModal({
      user,
      type,
      amount: '',
      note: ''
    });
  };

  const handleAdjustSubmit = async (event) => {
    event.preventDefault();
    if (!adjustModal) return;

    const amountValue = Number(adjustModal.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      alert('จำนวนเงินไม่ถูกต้อง');
      return;
    }

    try {
      setProcessing(true);
      const endpoint = adjustModal.type === 'add'
        ? `/admin/users/${adjustModal.user.id}/add-funds`
        : `/admin/users/${adjustModal.user.id}/deduct-funds`;
      await api.post(endpoint, { amount: amountValue, note: adjustModal.note.trim() || undefined });
      setAdjustModal(null);
      await loadUsers();
    } catch (err) {
      console.error('Failed to adjust balance:', err);
      alert(err.response?.data?.message || 'ทำรายการไม่สำเร็จ');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">จัดการผู้ใช้</h1>
        <p className="admin-page-subtitle">ดูยอดคงเหลือ ปรับยอด และติดตามสถานะผู้ใช้งานบนแพลตฟอร์ม</p>
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
          <div className="alert-icon">⚠️</div>
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
                            onClick={() => openAdjustModal(user, 'add')}
                            disabled={processing}
                            className="btn btn-success btn-sm"
                          >
                            เติมเงิน
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdjustModal(user, 'deduct')}
                            disabled={processing}
                            className="btn btn-danger btn-sm"
                          >
                            หักเงิน
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

      {adjustModal && (
        <div className="admin-modal">
          <form onSubmit={handleAdjustSubmit} className="admin-modal__content admin-modal__content--sm">
            <h2 className="admin-modal__title">
              {adjustModal.type === 'add' ? 'เติมเงินให้ผู้ใช้' : 'หักเงินจากผู้ใช้'}
            </h2>
            <p className="admin-modal__subtitle">
              ผู้ใช้: <strong>{adjustModal.user.username}</strong> · ยอดปัจจุบัน: ฿{Number(adjustModal.user.balance || 0).toFixed(2)}
            </p>
            <label className="admin-field admin-field--full">
              <span>จำนวนเงิน</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={adjustModal.amount}
                onChange={(e) => setAdjustModal((prev) => ({ ...prev, amount: e.target.value }))}
                className="form-input"
                placeholder="เช่น 500"
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                rows={3}
                value={adjustModal.note}
                onChange={(e) => setAdjustModal((prev) => ({ ...prev, note: e.target.value }))}
                className="form-textarea"
                placeholder="ระบุเหตุผลหรืออ้างอิง (ถ้ามี)"
              />
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdjustModal(null)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                {processing ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

