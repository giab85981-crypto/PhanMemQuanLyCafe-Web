import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './Login.css' // dùng chung style với trang Login cho đồng bộ

function ChangePassword() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới nhập lại không khớp')
      return
    }
    if (newPassword.length < 4) {
      setError('Mật khẩu mới quá ngắn (tối thiểu 4 ký tự)')
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/Accounts/${user.userName}/change-password`, {
        oldPassword,
        newPassword,
      })
      setSuccess('Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data || 'Mật khẩu cũ không đúng')
      } else {
        setError('Không thể kết nối máy chủ, thử lại sau')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>🔒 Đổi mật khẩu</h1>
        <p style={{ textAlign: 'center', margin: 0, opacity: 0.8 }}>
          Tài khoản: <b>{user?.userName}</b>
        </p>

        <label>
          Mật khẩu hiện tại
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Mật khẩu mới
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Nhập lại mật khẩu mới
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}
        {success && <p style={{ color: '#4caf50', fontSize: 13, margin: 0 }}>{success}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: '1px solid #555' }}
        >
          Quay lại trang chủ
        </button>
      </form>
    </div>
  )
}
export default ChangePassword