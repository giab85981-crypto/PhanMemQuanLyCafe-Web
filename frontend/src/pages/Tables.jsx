import { useState, useEffect } from 'react'
import api from '../api'

function Tables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/TableFoods')
      .then(res => { setTables(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <h1>Quản lý bàn</h1>
      <div className="table-grid">
        {tables.map(t => (
          <div key={t.id} className={`table-card ${t.status === 'Trống' ? 'empty' : 'occupied'}`}>
            <div className="table-name">{t.name}</div>
            <div className="table-status">{t.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default Tables