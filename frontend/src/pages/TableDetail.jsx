import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './TableDetail.css'

function TableDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [table, setTable] = useState(null)
  const [bill, setBill] = useState(null)       // Hóa đơn dạng BillDto
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [discount, setDiscount] = useState(0)

  const loadAll = useCallback(async () => {
    setError('')
    try {
      const [tableRes, foodsRes, catsRes] = await Promise.all([
        api.get(`/TableFoods/${id}`),
        api.get('/Foods'),
        api.get('/FoodCategories'),
      ])
      setTable(tableRes.data)
      setFoods(foodsRes.data)
      setCategories(catsRes.data)

      if (tableRes.data.status !== 'Trống') {
        try {
          const activeRes = await api.get(`/Bills/active-by-table/${id}`)
          if (activeRes.data?.id) {
            const billDtoRes = await api.get(`/Bills/${activeRes.data.id}`)
            setBill(billDtoRes.data)
            setDiscount(billDtoRes.data.discount || 0)
          }
        } catch {
          setBill(null)
        }
      } else {
        setBill(null)
      }
    } catch {
      setError('Không tải được dữ liệu bàn')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  // Xử lý nút Mở bàn chủ động
  async function handleCheckIn() {
    try {
      if (foods.length === 0) {
        setError('Chưa có danh sách món ăn để khởi tạo bàn')
        return
      }
      // Gọi API add-food để tự động tạo Bill và đổi trạng thái bàn sang "Có người" dưới Database
      const res = await api.post('/Bills/add-food', {
        tableId: Number(id),
        foodId: foods[0].id,
        count: 1
      })
      setBill(res.data)
      setTable(prev => ({ ...prev, status: 'Có người' }))
    } catch (err) {
      setError(err.response?.data || 'Không thể mở bàn')
    }
  }

  // Thêm món vào hóa đơn
  async function handleAddFood(foodId) {
    try {
      const res = await api.post('/Bills/add-food', {
        tableId: Number(id),
        foodId: foodId,
        count: 1
      })
      setBill(res.data)
      setTable(prev => ({ ...prev, status: 'Có người' }))
    } catch (err) {
      setError(err.response?.data || 'Không thể thêm món')
    }
  }

  // Xóa món khỏi hóa đơn
  async function handleRemoveItem(billInfoId) {
    try {
      const res = await api.delete(`/Bills/items/${billInfoId}`)
      setBill(res.data)
    } catch (err) {
      setError(err.response?.data || 'Không thể xóa món')
    }
  }

  // Thanh toán
  async function handleCheckout() {
    if (!bill) return
    if (!window.confirm('Xác nhận thanh toán và trả bàn?')) return
    try {
      await api.put(`/Bills/${bill.id}/checkout`, { discount: Number(discount) || 0 })
      navigate('/tables')
    } catch (err) {
      setError(err.response?.data || 'Không thể thanh toán')
    }
  }

  if (loading) return <p className="page">Đang tải...</p>
  if (!table) return <p className="page">Không tìm thấy bàn</p>

  const visibleFoods = activeCategory
    ? foods.filter(f => f.idCategory === activeCategory)
    : foods

  const items = bill?.items || []
  const subTotal = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="page table-detail">
      <div className="table-detail-header">
        <button className="back-btn" onClick={() => navigate('/tables')}>← Quay lại</button>
        <h1>{table.name} <span className={`status-badge ${table.status === 'Trống' ? 'empty' : 'occupied'}`}>{table.status}</span></h1>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Hiển thị bảng thông báo + nút Mở bàn nếu bàn đang trống */}
      {table.status === 'Trống' ? (
        <div className="empty-table-panel">
          <p>Bàn đang trống, chưa có khách.</p>
          <button className="checkin-btn" onClick={handleCheckIn}>Mở bàn</button>
        </div>
      ) : (
        /* Giao diện Order POS khi bàn đã mở */
        <div className="pos-layout">
          {/* Cột trái: chọn món kiểu POS */}
          <div className="pos-foods">
            <div className="category-tabs">
              <button
                className={activeCategory === null ? 'active' : ''}
                onClick={() => setActiveCategory(null)}
              >Tất cả</button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={activeCategory === c.id ? 'active' : ''}
                  onClick={() => setActiveCategory(c.id)}
                >{c.name}</button>
              ))}
            </div>
            <div className="food-grid">
              {visibleFoods.map(f => (
                <button key={f.id} className="food-btn" onClick={() => handleAddFood(f.id)}>
                  <span className="food-name">{f.name}</span>
                  <span className="food-price">{f.price.toLocaleString('vi-VN')} đ</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cột phải: hóa đơn hiện tại */}
          <div className="pos-order">
            <h2>Hóa đơn {bill ? `#${bill.id}` : ''}</h2>
            <div className="order-items">
              {items.length === 0 && (
                <p className="empty-order">Chưa chọn món nào</p>
              )}
              {items.map(item => (
                <div key={item.billInfoId} className="order-item">
                  <span className="item-name">{item.foodName}</span>
                  <span className="item-qty">x{item.count}</span>
                  <span className="item-total">
                    {item.amount.toLocaleString('vi-VN')} đ
                  </span>
                  <button className="remove-btn" onClick={() => handleRemoveItem(item.billInfoId)}>✕</button>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{subTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="summary-row">
                <label>Giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>
              <button
                className="checkout-btn"
                disabled={!bill || items.length === 0}
                onClick={handleCheckout}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableDetail