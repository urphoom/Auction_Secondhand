import { NavLink } from 'react-router-dom';

export const adminLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'แดชบอร์ด' },
  { to: '/admin/auctions', icon: '🏷️', label: 'การประมูล' },
  { to: '/admin/top-ups', icon: '💳', label: 'คำขอเติมเงิน' },
  { to: '/admin/users', icon: '👥', label: 'ผู้ใช้' }
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">⚙️</div>
        <div>
          <p className="admin-sidebar__subtitle">Auction Admin</p>
          <p className="admin-sidebar__title">AuctionHub Console</p>
        </div>
      </div>

      <nav className="admin-nav">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="admin-nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <NavLink to="/" className="admin-nav-link admin-nav-link--secondary">
          ↩︎ กลับสู่เว็บไซต์หลัก
        </NavLink>
      </div>
    </aside>
  );
}

