import { useState, useEffect } from 'react'
import api from '../api'

const emptyForm = { userName: '', displayName: '', passWord: '', type: 0 }

function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUserName, setEditingUserName] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // --- state cho modal "Đặt lại mật khẩu" ---
  const [resetForUser, setResetForUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetError, setResetError] = useState('')

  function loadAccounts() {
    setLoading(true)
    api.get('/Accounts')
      .then(res => { setAccounts(res.data); setLoading(false) })
      .catch(() => { setError('Không tải được danh sách tài khoản'); setLoading(false) })
  }

  useEffect(() => { loadAccounts() }, [])

  function openCreateForm() {
    setEditingUserName(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  function openEditForm(acc) {
    setEditingUserName(acc.userName)
    setForm({ userName: acc.userName, displayName: acc.displayName, passWord: '', type: acc.type })
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingUserName) {
        await api.put(`/Accounts/${editingUserName}`, {
          displayName: form.displayName,
          type: Number(form.type),
        })
      } else {
        await api.post('/Accounts', {
          userName: form.userName,
          displayName: form.displayName,
          passWord: form.passWord,
          type: Number(form.type),
        })
      }
      setShowForm(false)
      loadAccounts()
    } catch (err) {
      setError(err.response?.data || 'Có lỗi xảy ra, thử lại sau')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(userName) {
    if (!window.confirm(`Xóa tài khoản "${userName}"? Hành động này không thể hoàn tác.`)) return
    try {
      await api.delete(`/Accounts/${userName}`)
      loadAccounts()
    } catch {
      setError('Không thể xóa tài khoản này')
    }
  }

  // --- hàm cho modal "Đặt lại mật khẩu" ---
  function openResetForm(userName) {
    setResetForUser(userName)
    setNewPassword('')
    setResetError('')
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (newPassword.length < 4) {
      setResetError('Mật khẩu mới quá ngắn (tối thiểu 4 ký tự)')
      return
    }
    setResetSubmitting(true)
    setResetError('')
    try {
      await api.put(`/Accounts/${resetForUser}/reset-password`, { newPassword })
      alert(`Đã đặt lại mật khẩu cho tài khoản "${resetForUser}"`)
      setResetForUser(null)
    } catch (err) {
      setResetError(err.response?.data || 'Không thể đặt lại mật khẩu')
    } finally {
      setResetSubmitting(false)
    }
  }

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <div className="page-header-row">
        <h1>Quản lý tài khoản</h1>
        <button className="add-btn" onClick={openCreateForm}>+ Thêm tài khoản</button>
      </div>

      {error && <p className="login-error">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Tên đăng nhập</th>
            <th>Tên hiển thị</th>
            <th>Loại tài khoản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => (
            <tr key={acc.userName}>
              <td>{acc.userName}</td>
              <td>{acc.displayName}</td>
              <td>{acc.type === 1 ? 'Quản trị viên' : 'Nhân viên'}</td>
              <td>
                <button className="edit-btn" onClick={() => openEditForm(acc)}>Sửa</button>
                <button className="reset-btn" onClick={() => openResetForm(acc.userName)}>Đặt lại MK</button>
                <button className="delete-btn" onClick={() => handleDelete(acc.userName)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="modal-box" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingUserName ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h2>

            <label>
              Tên đăng nhập
              <input
                type="text"
                value={form.userName}
                disabled={!!editingUserName}
                onChange={e => setForm({ ...form, userName: e.target.value })}
                required
              />
            </label>

            <label>
              Tên hiển thị
              <input
                type="text"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </label>

            {!editingUserName && (
              <label>
                Mật khẩu
                <input
                  type="password"
                  value={form.passWord}
                  onChange={e => setForm({ ...form, passWord: e.target.value })}
                  required
                />
              </label>
            )}

            <label>
              Loại tài khoản
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value={0}>Nhân viên</option>
                <option value={1}>Quản trị viên</option>
              </select>
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {resetForUser && (
        <div className="modal-backdrop" onClick={() => setResetForUser(null)}>
          <form className="modal-box" onClick={e => e.stopPropagation()} onSubmit={handleResetPassword}>
            <h2>Đặt lại mật khẩu</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Tài khoản: <b>{resetForUser}</b>
            </p>
            <label>
              Mật khẩu mới
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoFocus
                required
              />
            </label>
            {resetError && <p className="login-error">{resetError}</p>}
            <div className="modal-actions">
              <button type="button" onClick={() => setResetForUser(null)}>Hủy</button>
              <button type="submit" disabled={resetSubmitting}>
                {resetSubmitting ? 'Đang lưu...' : 'Đặt lại'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
export default Accounts