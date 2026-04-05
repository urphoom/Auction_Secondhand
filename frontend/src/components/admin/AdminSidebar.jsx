import { NavLink } from 'react-router-dom';
import { Gavel } from 'lucide-react';

export const adminLinks = [
  { to: '/admin/dashboard', label: 'แดชบอร์ด' },
  { to: '/admin/auctions', label: 'การประมูล' },
  { to: '/admin/top-ups', label: 'คำขอเติมเงิน' },
  { to: '/admin/withdrawals', label: 'คำขอถอนเงิน' },
  { to: '/admin/users', label: 'ผู้ใช้' }
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo" aria-hidden>
          <Gavel size={26} strokeWidth={1.75} />
        </div>
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

