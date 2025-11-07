import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const formatDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const statusBadge = (status) => {
  const base = 'admin-status-pill';
  if (status === 'กำลังประมูล') return `${base} admin-status-pill--success`;
  return base;
};

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/auctions');
      setAuctions(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch admin auctions:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลการประมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const matchesSearch = auction.title.toLowerCase().includes(search.toLowerCase());
      const now = new Date();
      const end = new Date(auction.end_time);
      const status = end > now ? 'active' : 'ended';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status === 'active') ||
        (statusFilter === 'ended' && status === 'ended');
      return matchesSearch && matchesStatus;
    });
  }, [auctions, search, statusFilter]);

  const handleCancel = async (auction) => {
    if (!window.confirm(`ต้องการยุติการประมูล “${auction.title}” ทันทีหรือไม่?`)) {
      return;
    }

    try {
      await api.post(`/admin/auctions/${auction.id}/cancel`, { reason: 'Cancelled by admin dashboard' });
      await loadAuctions();
    } catch (err) {
      console.error('Failed to cancel auction:', err);
      alert(err.response?.data?.message || 'ไม่สามารถยุติการประมูลได้');
    }
  };

  const openEdit = (auction) => {
    setEditing({
      id: auction.id,
      title: auction.title,
      description: auction.description ?? '',
      bid_type: auction.bid_type,
      minimum_increment: auction.minimum_increment ?? '',
      buy_now_price: auction.buy_now_price ?? '',
      end_time: formatDateTimeLocal(auction.end_time)
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);
      const payload = {
        title: editing.title,
        description: editing.description || null,
        bid_type: editing.bid_type,
        minimum_increment: editing.minimum_increment === '' ? null : Number(editing.minimum_increment),
        buy_now_price: editing.buy_now_price === '' ? null : Number(editing.buy_now_price),
        end_time: editing.end_time ? new Date(editing.end_time).toISOString() : undefined
      };

      await api.patch(`/admin/auctions/${editing.id}`, payload);
      setEditing(null);
      await loadAuctions();
    } catch (err) {
      console.error('Failed to update auction:', err);
      alert(err.response?.data?.message || 'ไม่สามารถอัปเดตข้อมูลประมูลได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">จัดการการประมูล</h1>
        <p className="admin-page-subtitle">ตรวจสอบสถานะ ปรับเวลาปิด และดูแลการประมูลที่ต้องการการช่วยเหลือ</p>
      </div>

      <section className="admin-section">
        <div className="card">
          <div className="card-body admin-filters">
            <div className="admin-filters__inputs">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาจากชื่อการประมูล..."
                className="form-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">ทั้งหมด</option>
                <option value="active">กำลังประมูล</option>
                <option value="ended">สิ้นสุดแล้ว</option>
              </select>
            </div>
            <button onClick={loadAuctions} className="btn btn-secondary btn-sm">
               รีเฟรชข้อมูล
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="admin-state">
          <div className="loading">
            <div className="spinner" />
            <span>กำลังโหลดข้อมูลการประมูล...</span>
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
      ) : filteredAuctions.length === 0 ? (
        <div className="admin-empty-state">ไม่พบการประมูลที่ตรงกับเงื่อนไข</div>
      ) : (
        <div className="card admin-table-card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ชื่อการประมูล</th>
                    <th>ผู้ขาย</th>
                    <th>ราคาปัจจุบัน</th>
                    <th>สถานะ</th>
                    <th>ปิดประมูล</th>
                    <th className="admin-table-align-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id}>
                      <td>
                        <div className="admin-table-title">{auction.title}</div>
                        <div className="admin-table-meta">
                          ผู้ชนะล่าสุด: {auction.winner_username ?? '-'} ({auction.winning_bid_amount ?? '-'})
                        </div>
                      </td>
                      <td>{auction.seller_username ?? 'ไม่พบ'}</td>
                      <td className="admin-table-strong">฿{Number(auction.current_price || 0).toFixed(2)}</td>
                      <td>
                        <span className={statusBadge(auction.status)}>{auction.status}</span>
                      </td>
                      <td>{new Date(auction.end_time).toLocaleString('th-TH')}</td>
                      <td className="admin-table-align-right">
                        <div className="admin-table-actions">
                          <button onClick={() => openEdit(auction)} className="btn btn-secondary btn-sm">
                            แก้ไข
                          </button>
                          <button onClick={() => handleCancel(auction)} className="btn btn-danger btn-sm">
                            ยุติ
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

      {editing && (
        <div className="admin-modal">
          <form onSubmit={handleUpdate} className="admin-modal__content">
            <h2 className="admin-modal__title">แก้ไขการประมูล</h2>
            <div className="admin-modal__grid">
              <label className="admin-field">
                <span>ชื่อการประมูล</span>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  required
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>คำอธิบาย</span>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="form-textarea"
                />
              </label>
              <label className="admin-field">
                <span>ประเภทการประมูล</span>
                <select
                  value={editing.bid_type}
                  onChange={(e) => setEditing((prev) => ({ ...prev, bid_type: e.target.value }))}
                  className="form-input"
                >
                  <option value="increment">Increment</option>
                  <option value="sealed">Sealed</option>
                </select>
              </label>
              <label className="admin-field">
                <span>เวลาปิดประมูล</span>
                <input
                  type="datetime-local"
                  value={editing.end_time}
                  onChange={(e) => setEditing((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="form-input"
                />
              </label>
              <label className="admin-field">
                <span>ราคาซื้อทันที</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.buy_now_price}
                  onChange={(e) => setEditing((prev) => ({ ...prev, buy_now_price: e.target.value }))}
                  className="form-input"
                />
              </label>
              {editing.bid_type === 'increment' && (
                <label className="admin-field">
                  <span>ขั้นต่ำต่อครั้ง</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editing.minimum_increment}
                    onChange={(e) => setEditing((prev) => ({ ...prev, minimum_increment: e.target.value }))}
                    className="form-input"
                  />
                </label>
              )}
            </div>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

