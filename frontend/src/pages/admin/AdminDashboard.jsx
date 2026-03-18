import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value || 0));

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-state">
        <div className="loading">
          <div className="spinner" />
          <span>กำลังโหลดข้อมูลแดชบอร์ด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="admin-page-subtitle">สรุปภาพรวมการประมูล การเงิน และคำขอทั้งหมดภายในระบบ</p>
      </div>

      {error ? (
        <div className="alert alert-error">
          <div>
            <p className="alert-title">เกิดข้อผิดพลาด</p>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <section className="admin-section">
            <div className="admin-stat-grid">
              <StatCard
                title="ผู้ใช้ทั้งหมด"
                value={stats?.users?.total_users ?? 0}
                description={`ผู้ใช้ที่มียอดเงิน: ${stats?.users?.users_with_balance ?? 0}`}
                icon=""
              />
              <StatCard
                title="การประมูลทั้งหมด"
                value={stats?.auctions?.total_auctions ?? 0}
                description={`กำลังเปิด: ${stats?.auctions?.active_auctions ?? 0}`}
                icon=""
              />
              <StatCard
                title="ยอดชำระเงินรวม"
                value={formatCurrency(stats?.payments?.total_volume ?? 0)}
                description={`จำนวนรายการ: ${stats?.payments?.total_transactions ?? 0}`}
                icon=""
              />
              <StatCard
                title="คำขอที่รอดำเนินการ"
                value={stats?.topUps?.pending_requests ?? 0}
                description={`ทั้งหมด ${stats?.topUps?.total_requests ?? 0} รายการ`}
                icon=""
              />
            </div>
          </section>

          <section className="admin-section admin-section--split">
            <div className="card admin-section-card">
              <div className="card-header">
                <h2 className="card-title">ธุรกรรมล่าสุด</h2>
              </div>
              <div className="card-body admin-list">
                {stats?.recentTransactions?.length ? (
                  stats.recentTransactions.map((tx) => (
                    <div key={tx.id} className="admin-list-item">
                      <div className="admin-list-item__content">
                        <h3>{tx.auction_title}</h3>
                        <p>ผู้ชนะ: {tx.winner_username} · {new Date(tx.created_at).toLocaleString('th-TH')}</p>
                      </div>
                      <div className="admin-list-item__meta">
                        <span className="admin-meta-value">{formatCurrency(tx.amount)}</span>
                        <span className="admin-meta-status">{tx.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="ยังไม่มีธุรกรรม" />
                )}
              </div>
            </div>

            <div className="card admin-section-card">
              <div className="card-header card-header--split">
                <h2 className="card-title">คำขอเติมเงินล่าสุด</h2>
                <span className="admin-chip">ทั้งหมด {stats?.topUps?.total_requests ?? 0} รายการ</span>
              </div>
              <div className="card-body admin-list">
                {stats?.topUps?.recent?.length ? (
                  stats.topUps.recent.map((item) => (
                    <div key={item.id} className="admin-list-item">
                      <div className="admin-list-item__content">
                        <h3>{item.user_username}</h3>
                        <p>{new Date(item.created_at).toLocaleString('th-TH')}</p>
                      </div>
                      <div className="admin-list-item__meta">
                        <span className="admin-meta-value admin-meta-value--amber">{formatCurrency(item.amount)}</span>
                        <span className={`admin-status-tag admin-status-tag--${item.status}`}>
                          {item.status}
                        </span>
                        {item.processed_by_username && (
                          <span className="admin-meta-note">โดย {item.processed_by_username}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="ยังไม่มีคำขอเติมเงิน" />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon }) {
  return (
    <div className="card admin-stat-card">
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__title">{title}</p>
        <p className="admin-stat-card__value">{value}</p>
        {description && <p className="admin-stat-card__meta">{description}</p>}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="admin-empty-state">{message}</div>;
}

