import { useState, useEffect } from 'react'
import api from '../api'

function Bills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/Bills')
      .then(res => { setBills(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <h1>Hóa đơn</h1>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Ngày vào</th><th>Trạng thái</th><th>Tổng tiền</th></tr>
        </thead>
        <tbody>
          {bills.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{new Date(b.dateCheckIn).toLocaleString('vi-VN')}</td>
              <td>{b.status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
              <td>{b.totalPrice.toLocaleString('vi-VN')} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default Bills