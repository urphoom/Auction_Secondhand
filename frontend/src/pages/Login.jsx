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
    <div className="page login-page">
      <div className="page-content">
        <div className="container">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-sm login-form">
              <div className="card">
                <div className="card-header text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">เข้าสู่ระบบ</h2>
                  <p className="text-sm text-gray-500">ลงชื่อเข้าใช้เพื่อจัดการการประมูลของคุณ</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        ชื่อผู้ใช้
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="form-input"
                        placeholder="ชื่อผู้ใช้ของคุณ"
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
                        placeholder="รหัสผ่านของคุณ"
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

                    <div className="login-submit-wrapper">
                      <button
                        type="submit"
                        className="btn btn-bid-primary w-full login-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="loading">
                            <div className="spinner"></div>
                            <span>กำลังเข้าสู่ระบบ...</span>
                          </div>
                        ) : (
                          <span>เข้าสู่ระบบ</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="card-footer mt-4">
                  <div className="text-center">
                    <p className="text-sm text-secondary">
                      ยังไม่มีบัญชี?{' '}
                      <Link to="/register" className="text-primary-600 font-semibold hover:underline">
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