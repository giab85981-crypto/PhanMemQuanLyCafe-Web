import { useState, useEffect } from 'react'
import api from '../api'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/FoodCategories')
      .then(res => { setCategories(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <h1>Danh mục món ăn</h1>
      <table className="data-table">
        <thead><tr><th>ID</th><th>Tên danh mục</th></tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}><td>{c.id}</td><td>{c.name}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default Categories