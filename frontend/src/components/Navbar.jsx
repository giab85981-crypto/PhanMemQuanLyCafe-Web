import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">☕ Quán Cà Phê</div>
      <div className="navbar-links">
        <NavLink to="/" end className="nav-link">Trang chủ</NavLink>
        <NavLink to="/foods" className="nav-link">Món ăn</NavLink>
        <NavLink to="/categories" className="nav-link">Danh mục</NavLink>
        <NavLink to="/tables" className="nav-link">Quản lý bàn</NavLink>
        <NavLink to="/bills" className="nav-link">Hóa đơn</NavLink>
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <span>{user.displayName} ({user.role})</span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <NavLink to="/login" className="nav-link">Đăng nhập</NavLink>
        )}
      </div>
    </nav>
  )
}

export default Navbar