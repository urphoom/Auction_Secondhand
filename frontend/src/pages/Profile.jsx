import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { UserCog, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });

  const [profile, setProfile] = useState({
    username: '',
    phone: '',
    email: '',
    role: '',
    balance: 0
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const loadMe = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.get('/users/me');
      setProfile({
        username: data.username || '',
        phone: data.phone || '',
        email: data.email || '',
        role: data.role || '',
        balance: Number(data.balance || 0)
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMessage({ type: '', text: '' });

    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwMessage({ type: 'error', text: 'กรุณากรอกรหัสผ่านให้ครบถ้วน' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwMessage({ type: 'error', text: 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPwMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
    } catch (error) {
      setPwMessage({ type: 'error', text: error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page profile-page">
      <div className="page-content">
        <div className="container">
          <div className="profile-hero">
            <div className="profile-hero__icon">
              <UserCog size={22} />
            </div>
            <div className="profile-hero__body">
              <h1 className="profile-hero__title">จัดการโปรไฟล์</h1>
              <p className="profile-hero__subtitle">
                {user?.username ? `${user.username} · ` : ''}
                {profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="profile-grid">
            <div className="card">
              <div className="card-header profile-card-header">
                <div className="profile-card-title">
                  <ShieldCheck size={18} />
                  <h2 className="card-title">ข้อมูลพื้นฐาน</h2>
                </div>
              </div>
              <div className="card-body">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-username">
                      ชื่อผู้ใช้
                    </label>
                    <input
                      id="profile-username"
                      className="form-input"
                      value={profile.username}
                      disabled
                      placeholder="ชื่อผู้ใช้"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-role">
                      บทบาท
                    </label>
                    <input
                      id="profile-role"
                      className="form-input"
                      value={profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">
                      เบอร์โทร
                    </label>
                    <input
                      id="profile-phone"
                      className="form-input"
                      value={profile.phone}
                      disabled
                      placeholder="—"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-email">
                      อีเมล
                    </label>
                    <input
                      id="profile-email"
                      className="form-input"
                      value={profile.email}
                      disabled
                      placeholder="—"
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  {/* intentionally left empty: basic info is read-only */}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header profile-card-header">
                <div className="profile-card-title">
                  <ShieldCheck size={18} />
                  <h2 className="card-title">เปลี่ยนรหัสผ่าน</h2>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={submitPassword}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pw-current">
                      รหัสผ่านปัจจุบัน
                    </label>
                    <input
                      id="pw-current"
                      type="password"
                      className="form-input"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      disabled={changingPassword}
                      placeholder="รหัสผ่านปัจจุบัน"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pw-new">
                      รหัสผ่านใหม่
                    </label>
                    <input
                      id="pw-new"
                      type="password"
                      className="form-input"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                      disabled={changingPassword}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pw-confirm">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      id="pw-confirm"
                      type="password"
                      className="form-input"
                      value={pwForm.confirmNewPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                      disabled={changingPassword}
                      placeholder="ยืนยันรหัสผ่านใหม่"
                    />
                  </div>

                  {pwMessage.text && (
                    <div className={`alert ${pwMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                      <span className="text-sm">{pwMessage.text}</span>
                    </div>
                  )}

                  <div className="profile-actions">
                    <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                      {changingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

