import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data);
      // Force a full reload so Navbar and other global UI reflect auth state immediately
      window.location.replace('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="container">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title text-center">ยินดีต้อนรับกลับ! 👋</h2>
                  <p className="text-center text-muted">เข้าสู่ระบบบัญชี AuctionHub ของคุณ</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        ชื่อผู้ใช้
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="form-input"
                        placeholder="ใส่ชื่อผู้ใช้ของคุณ"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        รหัสผ่าน
                      </label>
                      <input
                        id="password"
                        type="password"
                        className="form-input"
                        placeholder="ใส่รหัสผ่านของคุณ"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <div className="alert alert-error">
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="loading">
                            <div className="spinner"></div>
                            <span>กำลังเข้าสู่ระบบ...</span>
                          </div>
                        ) : (
                          <>
                            <span>🔑</span>
                            <span>เข้าสู่ระบบ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="card-footer">
                  <div className="text-center">
                    <p className="text-sm text-secondary">
                      ยังไม่มีบัญชี?{' '}
                      <Link to="/register" className="text-primary font-medium hover:underline">
                        สมัครสมาชิกที่นี่
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}