import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Tables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/TableFoods')
      .then(res => { 
        console.log("Dữ liệu bàn nhận từ API:", res.data); // Kiểm tra tên thuộc tính ID
        setTables(res.data); 
        setLoading(false) 
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách bàn:", err);
        setLoading(false)
      })
  }, [])

  const handleTableClick = (table) => {
    const tableId = table.id || table.idTable;
    console.log("Đã click vào bàn ID:", tableId);
    
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
        {tables.map(t => {
          const tableId = t.id || t.idTable;
          return (
            <div
              key={tableId}
              className={`table-card ${t.status === 'Trống' ? 'empty' : 'occupied'}`}
              onClick={() => handleTableClick(t)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="table-name">{t.name}</div>
              <div className="table-status">{t.status}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tables