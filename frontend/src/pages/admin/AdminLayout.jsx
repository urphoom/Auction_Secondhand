import { Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import AdminSidebar, { adminLinks } from '../../components/admin/AdminSidebar.jsx';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading">
          <div className="spinner" />
          <span>กำลังตรวจสอบสิทธิ์แอดมิน...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header__info">
            <span className="admin-header__label">ผู้ดูแลระบบ</span>
            <span className="admin-header__user">{user.username}</span>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            ออกจากระบบ
          </button>
        </header>

        <nav className="admin-mobile-nav">
          {adminLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-mobile-link ${isActive ? 'is-active' : ''}`
              }
            >
              {item.icon && <span className="admin-mobile-link__icon">{item.icon}</span>}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="admin-body">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

