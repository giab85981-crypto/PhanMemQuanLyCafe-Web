import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
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
    </nav>
  )
}

export default Navbar