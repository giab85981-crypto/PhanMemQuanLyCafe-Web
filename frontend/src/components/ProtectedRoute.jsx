import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// requiredRole: nếu truyền "Admin" thì chỉ Admin mới vào được, còn lại chỉ cần đăng nhập
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="page">Đang tải...</p>
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <p className="page error">Bạn không có quyền truy cập trang này</p>
  }

  return children
}

export default ProtectedRoute