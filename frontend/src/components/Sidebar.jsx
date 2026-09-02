import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const links = [
  { to: '/', label: 'Trang chủ', icon: '🏠', end: true },
  { to: '/foods', label: 'Món ăn', icon: '🍽️' },
  { to: '/categories', label: 'Danh mục', icon: '🏷️' },
  { to: '/tables', label: 'Quản lý bàn', icon: '🪑' },
  { to: '/bills', label: 'Hóa đơn', icon: '🧾' },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
    setMobileOpen(false)
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  const initial = user?.displayName?.charAt(0)?.toUpperCase() || '?'

  return (
    <>
      <div className="mobile-topbar">
        <div className="sidebar-brand">
          <span className="logo-icon">☕</span>
          <span>Quán Cà Phê</span>
        </div>
        <button className="sidebar-toggle" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
      </div>

      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="logo-icon">☕</span>
            <span>Quán Cà Phê</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={closeMobile}
              title={link.label}
            >
              <span className="icon">{link.icon}</span>
              <span className="link-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="sidebar-user" title={`${user.displayName} (${user.role})`}>
                <div className="user-avatar">{initial}</div>
                <div className="user-details">
                  <span className="user-name">{user.displayName}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <button className="sidebar-logout" onClick={handleLogout}>
                <span className="icon">🚪</span>
                <span className="link-text">Đăng xuất</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="sidebar-login" onClick={closeMobile}>
              <span className="icon">🔑</span>
              <span className="link-text">Đăng nhập</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar