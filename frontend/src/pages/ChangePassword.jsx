import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './ChangePassword.css'

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
    <div className="cp-page">
      <form className="cp-box" onSubmit={handleSubmit}>
        <div className="cp-icon">🔒</div>
        <h1>Đổi mật khẩu</h1>
        <p className="cp-subtitle">
          Tài khoản: <b>{user?.userName}</b>
        </p>

        <div className="cp-field">
          <label className="cp-label">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="cp-field">
          <label className="cp-label">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="cp-field">
          <label className="cp-label">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="cp-error">{error}</p>}
        {success && <p className="cp-success">{success}</p>}

        <button type="submit" className="cp-submit" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
        <button type="button" className="cp-secondary" onClick={() => navigate('/')}>
          Quay lại trang chủ
        </button>
      </form>
    </div>
  )
}
export default ChangePassword