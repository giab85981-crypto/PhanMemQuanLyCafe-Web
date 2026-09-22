import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

// --- CÁC TRANG (PAGES) ---
import Dashboard from './pages/Dashboard' // <-- ĐÃ THÊM: Trang Dashboard giao diện mới
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

// Bọc quanh <Routes>: mỗi lần đổi URL, key đổi theo -> React remount
// -> animation "page-enter" trong App.css tự chạy lại từ đầu.
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div className="page-enter" key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        
        {/* ĐỔI TRANG CHỦ MẶC ĐỊNH SANG DASHBOARD MỚI */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/foods" element={<Foods />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tables" element={<Tables />} />
        
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App