import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const MIN_WITHDRAW = 300;
const WITHDRAW_FEE = Number(import.meta.env.VITE_WITHDRAW_FEE || 20);

const bankOptions = [
  'ธนาคารกสิกรไทย',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงเทพ',
  'ธนาคารกรุงไทย',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารทหารไทยธนชาต (ttb)',
  'ธนาคารออมสิน',
  'ธนาคารเกียรตินาคินภัทร',
  'ธนาคารยูโอบี',
  'ธนาคารซีไอเอ็มบี ไทย'
];

const statusMeta = {
  pending: { label: 'รอตรวจสอบ', className: 'topup-status topup-status--pending' },
  approved: { label: 'ถอนเงินสำเร็จ', className: 'topup-status topup-status--approved' },
  rejected: { label: 'ถูกปฏิเสธ', className: 'topup-status topup-status--rejected' }
};

export default function Withdraw() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [listError, setListError] = useState('');

  const withdrawable = useMemo(() => Number(balance || 0), [balance]);
  const numericAmount = useMemo(() => Number(amount || 0), [amount]);
  const payoutAmount = useMemo(() => {
    const fee = Number.isFinite(WITHDRAW_FEE) ? WITHDRAW_FEE : 0;
    return Math.max(0, Number((numericAmount - fee).toFixed(2)));
  }, [numericAmount]);

  const loadBalance = async () => {
    try {
      const { data } = await api.get('/users/me');
      const next = Number(data.balance) || 0;
      setBalance(next);
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: next }));
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setListError('');
      const { data } = await api.get('/withdrawals/me');
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      setListError('ไม่สามารถโหลดประวัติคำขอถอนเงินได้');
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadBalance();
    loadRequests();
  }, []);

  const resetForm = () => {
    setAmount('');
    setBankName('');
    setAccountNumber('');
    setAccepted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!amount || Number(amount) < MIN_WITHDRAW) {
      setMessage({ type: 'error', text: `จำนวนเงินถอนขั้นต่ำคือ ฿${MIN_WITHDRAW}` });
      return;
    }
    if (Number(amount) > withdrawable) {
      setMessage({ type: 'error', text: 'ยอดที่ถอนได้ไม่เพียงพอ' });
      return;
    }
    if (!bankName) {
      setMessage({ type: 'error', text: 'กรุณาเลือกธนาคาร' });
      return;
    }
    if (!accountNumber || accountNumber.trim().length < 6) {
      setMessage({ type: 'error', text: 'กรุณากรอกเลขบัญชีให้ถูกต้อง' });
      return;
    }
    if (!accepted) {
      setMessage({ type: 'error', text: 'กรุณายอมรับเงื่อนไขก่อนส่งคำขอถอนเงิน' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/withdrawals', {
        amount: Number(amount).toFixed(2),
        bankName,
        accountNumber: accountNumber.trim(),
        acceptedTerms: true
      });

      setMessage({ type: 'success', text: 'ส่งคำขอถอนเงินเรียบร้อยแล้ว สถานะ: รอตรวจสอบ' });
      resetForm();
      await loadBalance();
      await loadRequests();
    } catch (error) {
      console.error('Failed to submit withdrawal:', error);
      const apiMessage = error.response?.data?.message;
      setMessage({ type: 'error', text: apiMessage || 'ไม่สามารถส่งคำขอถอนเงินได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title"> ถอนเงิน</h1>
            <p className="page-subtitle">กรอกข้อมูลบัญชีธนาคารและจำนวนเงินที่ต้องการถอน ระบบจะหักยอดทันทีและรอแอดมินตรวจสอบ</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container topup-page">
          <div className="topup-grid">
            <div className="card topup-card">
              <div className="card-content">
                <h2 className="topup-section-title">ส่งคำขอถอนเงิน</h2>
                <p className="topup-section-subtitle">
                  ยอดที่ถอนได้: <strong>฿{withdrawable.toFixed(2)}</strong> · ถอนขั้นต่ำ ฿{MIN_WITHDRAW}
                </p>

                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
                    <span>{message.text}</span>
                  </div>
                )}

                <form className="topup-form" onSubmit={handleSubmit}>
                  <label className="topup-field">
                    <span>จำนวนเงินที่ต้องการถอน (บาท) *</span>
                    <input
                      type="number"
                      min={MIN_WITHDRAW}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`ขั้นต่ำ ${MIN_WITHDRAW}`}
                      disabled={submitting}
                    />
                    <small className="text-muted">
                      จะได้รับสุทธิประมาณ ฿{payoutAmount.toFixed(2)} (ค่าธรรมเนียม ฿{Number.isFinite(WITHDRAW_FEE) ? WITHDRAW_FEE.toFixed(2) : '0.00'})
                    </small>
                  </label>

                  <label className="topup-field">
                    <span>ธนาคาร *</span>
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={submitting}>
                      <option value="">-- เลือกธนาคาร --</option>
                      {bankOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="topup-field">
                    <span>เลขบัญชี *</span>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="เช่น 0123456789"
                      disabled={submitting}
                    />
                  </label>

                  <label className="topup-field">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={submitting} />
                      <span>
                        ข้าพเจ้ายืนยันว่าชื่อบัญชีธนาคารตรงกับชื่อผู้ใช้งาน และยอมรับค่าธรรมเนียมการถอนเงิน{' '}
                        <strong>{Number.isFinite(WITHDRAW_FEE) ? WITHDRAW_FEE.toFixed(2) : '0.00'}</strong> บาท
                      </span>
                    </div>
                  </label>

                  <div className="topup-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอถอนเงิน'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card topup-card">
              <div className="card-content">
                <h2 className="topup-section-title">ประวัติคำขอถอนเงิน</h2>
                <p className="topup-section-subtitle">ติดตามสถานะและเปิดดูสลิปหลักฐานเมื่อถอนสำเร็จ</p>

                {loadingRequests ? (
                  <div className="topup-loading">
                    <div className="spinner" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                ) : listError ? (
                  <div className="alert alert-error mt-4">
                    <span>{listError}</span>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="topup-empty">
                    <p>ยังไม่มีคำขอถอนเงิน</p>
                    <span>เมื่อส่งคำขอแล้วจะสามารถติดตามสถานะได้ที่นี่</span>
                  </div>
                ) : (
                  <div className="topup-history">
                    {requests.map((req) => {
                      const status = statusMeta[req.status] || statusMeta.pending;
                      return (
                        <div key={req.id} className="topup-history-card">
                          <div className="topup-history-header">
                            <div className="topup-history-title">
                              <h3>คำขอ #{req.id}</h3>
                              <p className="topup-history-date">ส่งเมื่อ {new Date(req.created_at).toLocaleString('th-TH')}</p>
                            </div>
                            <span className={`topup-history-status ${status.className}`}>{status.label}</span>
                          </div>

                          <div className="topup-history-body">
                            <div>
                              <span className="topup-history-label">จำนวนเงิน</span>
                              <p className="topup-history-value">฿{Number(req.amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="topup-history-label">บัญชีปลายทาง</span>
                              <p className="topup-history-value">
                                {req.bank_name} · {req.account_number}
                              </p>
                              <p className="text-muted text-sm">สุทธิ ฿{Number(req.payout_amount || 0).toFixed(2)} · ค่าธรรมเนียม ฿{Number(req.fee || 0).toFixed(2)}</p>
                            </div>
                          </div>

                          {req.note && (
                            <div className="topup-history-note">
                              <span>หมายเหตุ</span>
                              <p>{req.note}</p>
                            </div>
                          )}

                          {req.slip_url && (
                            <div className="topup-history-slip">
                              <span className="topup-history-label">สลิปหลักฐาน</span>
                              <img
                                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '')}${req.slip_url}`}
                                alt={`สลิปถอนเงิน #${req.id}`}
                              />
                              <a
                                href={`${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '')}${req.slip_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="topup-link"
                              >
                                เปิดดูขนาดเต็ม
                              </a>
                            </div>
                          )}

                          {req.processed_by_username && req.processed_at && (
                            <div className="topup-history-processed">
                              <span>
                                ดำเนินการโดย {req.processed_by_username} เมื่อ {new Date(req.processed_at).toLocaleString('th-TH')}
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

