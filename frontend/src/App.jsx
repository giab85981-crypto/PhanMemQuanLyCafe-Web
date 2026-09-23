import { BrowserRouter, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { 
  LayoutDashboard, 
  Utensils, 
  Grid, 
  FileText, 
  Users, 
  ShoppingCart, 
  LogOut, 
  Bell, 
  Coffee,
  User,
  KeyRound
} from 'lucide-react'

// --- CÁC TRANG (PAGES) ---
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Foods from './pages/Foods'
import Categories from './pages/Categories'
import Tables from './pages/Tables'
import Bills from './pages/Bills'
import Login from './pages/Login'
import TableDetail from './pages/TableDetail'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'
import Accounts from './pages/Accounts'

import './App.css'

// COMPONENT HEADER / NAVBAR DÙNG CHUNG
function Header() {
  const location = useLocation()
  const { user, logout } = useAuth() // Giả định AuthContext có hàm logout và object user
  const navigate = useNavigate()

  // Nơi ẩn Header nếu ở trang Đăng nhập
  if (location.pathname === '/login') return null

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-[#1b75d0] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* LOGO & MENU PHÂN HỆ */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 font-bold text-lg">
            <div className="bg-white p-1 rounded-full text-[#1b75d0]">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="tracking-wide">KiotCafe</span>
          </Link>

          {/* NAVIGATION LINKS */}
          <nav className="flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                isActive('/') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan</span>
            </Link>

            <Link 
              to="/foods" 
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                isActive('/foods') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Thực đơn</span>
            </Link>

            <Link 
              to="/tables" 
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                isActive('/tables') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Phòng/Bàn</span>
            </Link>

            <Link 
              to="/bills" 
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                isActive('/bills') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Hóa đơn</span>
            </Link>

            {/* Chỉ Admin mới xem được quản lý tài khoản */}
            {user?.role === 'Admin' && (
              <Link 
                to="/accounts" 
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                  isActive('/accounts') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Nhân viên</span>
              </Link>
            )}
          </nav>
        </div>

        {/* THÔNG TIN TÀI KHOẢN & NÚT THU NGÂN */}
        <div className="flex items-center space-x-3">
          {/* Nút Thu Ngân / Màn hình POS */}
          <Link 
            to="/tables" 
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3.5 py-1.5 rounded-md text-sm shadow transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Thu ngân</span>
          </Link>

          {/* User profile dropdown/menu ngắn */}
          <div className="flex items-center space-x-2 pl-3 border-l border-blue-400">
            <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center font-bold text-xs border border-blue-300">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-xs">
                <div className="font-semibold leading-tight">{user?.displayName || 'Tài khoản'}</div>
                <div className="text-blue-200 text-[10px]">{user?.role || 'Nhân viên'}</div>
              </div>
            </Link>

            <Link to="/change-password" title="Đổi mật khẩu" className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-600 rounded transition">
              <KeyRound className="w-4 h-4" />
            </Link>

            <button 
              onClick={logout} 
              title="Đăng xuất" 
              className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-600 rounded transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div className="page-enter" key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/foods" 
          element={
            <ProtectedRoute>
              <Foods />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tables" 
          element={
            <ProtectedRoute>
              <Tables />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tables/:id"
          element={
            <ProtectedRoute>
              <TableDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute requiredRole="Admin">
              <Accounts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Header />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}