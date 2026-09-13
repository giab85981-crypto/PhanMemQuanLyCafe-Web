import { useState, useEffect } from 'react'
import api from '../api'

const PAGE_SIZE = 30

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    api.get('/FoodCategories')
      .then(res => { setCategories(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="page">Đang tải...</p>

  const visibleCategories = categories.slice(0, visibleCount)
  const hasMore = visibleCount < categories.length

  return (
    <div className="page">
      <h1>Danh mục món ăn</h1>
      <table className="data-table">
        <thead><tr><th>ID</th><th>Tên danh mục</th></tr></thead>
        <tbody>
          {visibleCategories.map(c => (
            <tr key={c.id}><td>{c.id}</td><td>{c.name}</td></tr>
          ))}
        </tbody>
      </table>

      <p className="load-more-info">Hiển thị {visibleCategories.length} / {categories.length} danh mục</p>

      {hasMore && (
        <button className="load-more-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
          Tải thêm
        </button>
      )}
    </div>
  )
}
export default Categories