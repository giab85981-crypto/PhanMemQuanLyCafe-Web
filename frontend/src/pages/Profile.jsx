import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function EditableRow({ label, value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!draft.trim()) { setError('Không được để trống'); return }
    setSaving(true)
    setError('')
    try {
      await onSave(draft.trim())
      setEditing(false)
    } catch (err) {
      setError(err.response?.data || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(value)
    setEditing(false)
    setError('')
  }

  return (
    <div className="profile-row">
      <span className="profile-label">{label}</span>
      {editing ? (
        <div className="profile-edit-inline">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
          />
          <button type="button" onClick={handleSave} disabled={saving}>✔</button>
          <button type="button" onClick={handleCancel} disabled={saving}>✕</button>
        </div>
      ) : (
        <span className="profile-value-editable" onClick={() => setEditing(true)} title="Bấm để sửa">
          {value} <span className="edit-icon">✎</span>
        </span>
      )}
      {error && <div className="profile-row-error">{error}</div>}
    </div>
  )
}

function Profile() {
  const { user, updateUser } = useAuth()
  if (!user) return null

  async function handleSaveDisplayName(newName) {
    await api.put(`/Accounts/${user.userName}`, {
      displayName: newName,
      type: user.type,
    })
    updateUser({ displayName: newName })
  }

  return (
    <div className="page">
      <h1>Thông tin cá nhân</h1>
      <div className="profile-card">
        <div className="profile-row">
          <span className="profile-label">Tên đăng nhập</span>
          <span className="profile-value-locked" title="Tên đăng nhập là khóa chính, không thể thay đổi">
            {user.userName} 🔒
          </span>
        </div>

        <EditableRow
          label="Tên hiển thị"
          value={user.displayName}
          onSave={handleSaveDisplayName}
        />

        <div className="profile-row">
          <span className="profile-label">Loại tài khoản</span>
          <span>{user.role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
        </div>
      </div>
      <NavLink to="/change-password" className="profile-change-pw-btn">
        🔒 Đổi mật khẩu
      </NavLink>
    </div>
  )
}
export default Profile