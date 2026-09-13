import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Tables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/TableFoods')
      .then(res => { setTables(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleTableClick = (table) => {
    const tableId = table.id || table.idTable;
    if (!tableId) {
      alert("Lỗi: Không tìm thấy ID của bàn!");
      return;
    }
    navigate(`/tables/${tableId}`);
  }

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <h1>Quản lý bàn</h1>
      <div className="table-grid">
        {tables.map((t, i) => {
          const tableId = t.id || t.idTable;
          const isEmpty = t.status === 'Trống';
          return (
            <div
              key={tableId}
              className={`table-card ${isEmpty ? 'empty' : 'occupied'}`}
              onClick={() => handleTableClick(t)}
              style={{ cursor: 'pointer', userSelect: 'none', animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <span className="table-icon">{isEmpty ? '🪑' : '🍽️'}</span>
              <div className="table-name">{t.name}</div>
              <span className="table-status">
                <span className="status-dot"></span>
                {t.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tables