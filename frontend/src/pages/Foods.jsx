import { useState, useEffect } from 'react'
import api from '../api'

function Foods() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/Foods')
      .then(res => { setFoods(res.data); setLoading(false) })
      .catch(() => { setError('Không thể tải danh sách món ăn'); setLoading(false) })
  }, [])

  if (loading) return <p className="page">Đang tải...</p>
  if (error) return <p className="page error">{error}</p>

  return (
    <div className="page">
      <h1>Danh sách món ăn</h1>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Tên món</th><th>Giá</th></tr>
        </thead>
        <tbody>
          {foods.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.name}</td>
              <td>{f.price.toLocaleString('vi-VN')} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default Foods