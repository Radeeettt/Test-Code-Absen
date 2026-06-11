import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export default function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="navbar">
      <div className="navbar-left">
        {onMenuToggle && (
          <button
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
          >
            <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        )}
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <span className="brand-name">WFH Attendance</span>
            <span className="brand-sub">System</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className={`user-role ${user?.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
              {user?.role === 'admin' ? '👑 Admin HRD' : '👤 Karyawan'}
            </span>
          </div>
        </div>
        <button className="btn-logout" onClick={logout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
