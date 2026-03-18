import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Phone validation (Thai phone number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/register', { username, password, phone, email });
      navigate('/login');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page register-page">
      <div className="page-content">
        <div className="container">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-sm register-form">
              <div className="card">
                <div className="card-header text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">สร้างบัญชีใหม่</h2>
                  <p className="text-sm text-gray-500">กรอกข้อมูลของคุณเพื่อเริ่มใช้งานการประมูล</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        ชื่อผู้ใช้ * <span className="text-sm text-gray-500 font-normal">(ต้องมีอย่างน้อย 3 ตัวอักษร)</span>
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="form-input"
                        placeholder="เลือกชื่อผู้ใช้"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        minLength={3}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        รหัสผ่าน * <span className="text-sm text-gray-500 font-normal">(ต้องมีอย่างน้อย 6 ตัวอักษร)</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        className="form-input"
                        placeholder="สร้างรหัสผ่าน"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        ยืนยันรหัสผ่าน
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="form-input"
                        placeholder="ยืนยันรหัสผ่านของคุณ"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="form-input"
                        placeholder="0812345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={loading}
                        maxLength={10}
                      />
                      <div className="form-help">กรุณาใส่เบอร์โทร 10 หลัก</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        อีเมล
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-input"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <div className="form-help">กรุณาใส่อีเมลที่ถูกต้อง</div>
                    </div>

                    {error && (
                      <div className="alert alert-error mt-2">
                        {error}
                      </div>
                    )}

                    <div className="register-submit-wrapper">
                      <button
                        type="submit"
                        className="btn btn-bid-primary w-full register-submit-btn"
                        disabled={loading}
                      >
                        {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-6">
                    <p className="text-sm text-secondary">
                      มีบัญชีอยู่แล้ว?{' '}
                      <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                        เข้าสู่ระบบที่นี่
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