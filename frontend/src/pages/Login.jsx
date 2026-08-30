import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './Login.css'

function Login() {
  const [userName, setUserName] = useState('')
  const [passWord, setPassWord] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/Accounts/login', { userName, passWord })
      login(res.data) // lưu { token, userName, displayName, type, role }
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Sai tài khoản hoặc mật khẩu')
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
        <h1>☕ Đăng nhập</h1>
        <label>
          Tên đăng nhập
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={passWord}
            onChange={(e) => setPassWord(e.target.value)}
            required
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login