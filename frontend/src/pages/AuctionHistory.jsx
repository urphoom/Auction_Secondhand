import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

const formatCurrency = (v) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(v || 0));

export default function AuctionHistory() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role === 'admin') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auctions/my-bid-history');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
        setError('');
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'ไม่สามารถโหลดประวัติการประมูลได้');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

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

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">ประวัติการประมูล</h1>
            <p className="page-subtitle">
              รายการการประมูลที่คุณเคยเข้าร่วม (แสดงราคาล่าสุดที่คุณเสนอต่อการประมูลแต่ละรายการ)
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="loading">
                <div className="spinner" />
                <span>กำลังโหลด...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : rows.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12 text-gray-600">
                <p className="mb-2">ยังไม่มีประวัติการเข้าร่วมประมูล</p>
                <Link to="/auctions" className="text-primary-600 font-medium hover:underline">
                  ไปเรียกดูการประมูล
                </Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>การประมูล</th>
                        <th>ราคาที่คุณเสนอ</th>
                        <th>สถานะการประมูล</th>
                        <th>ผลลัพธ์</th>
                        <th>เสนอล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const ended = new Date(row.end_time) <= new Date();
                        const statusLabel = ended ? 'จบแล้ว' : 'กำลังประมูล';
                        let outcomeLabel = '—';
                        if (ended) {
                          outcomeLabel = row.i_won ? 'ชนะการประมูล' : 'ไม่ชนะ';
                        } else {
                          outcomeLabel = 'รอประกาศผล';
                        }
                        return (
                          <tr key={row.id}>
                            <td>
                              <Link
                                to={`/auctions/${row.id}`}
                                className="admin-table-title hover:text-primary-600"
                              >
                                {row.title}
                              </Link>
                              <div className="admin-table-meta mt-1">
                                {row.bid_type === 'sealed' ? 'แบบปิด' : 'แบบเปิด'} · ราคาปัจจุบัน{' '}
                                {formatCurrency(row.current_price)}
                              </div>
                            </td>
                            <td className="admin-table-strong">{formatCurrency(row.my_bid_amount)}</td>
                            <td>
                              <span className={`badge ${ended ? 'badge-info' : 'badge-success'}`}>{statusLabel}</span>
                            </td>
                            <td>
                              <span className={`text-sm font-medium whitespace-nowrap ${row.i_won ? 'text-green-700' : ended ? 'text-gray-600' : 'text-amber-700'}`}>
                                {outcomeLabel}
                              </span>
                            </td>
                            <td className="text-sm text-gray-600">
                              {row.my_bid_at ? new Date(row.my_bid_at).toLocaleString('th-TH') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/orders" className="text-primary-600 hover:underline">
              จัดการคำสั่งซื้อ (ฝั่งผู้ขาย)
            </Link>
            {' · '}
            <Link to="/payments" className="text-primary-600 hover:underline">
              การชำระเงินของฝั่งผู้ซื้อ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
