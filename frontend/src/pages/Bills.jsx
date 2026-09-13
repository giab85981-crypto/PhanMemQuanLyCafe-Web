import { useState, useEffect, useMemo } from 'react'
import api from '../api'
import './Bills.css'

const PAGE_SIZE = 30

function Bills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | paid | unpaid
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    api.get('/Bills')
      .then(res => { setBills(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredBills = useMemo(() => {
    if (filter === 'paid') return bills.filter(b => b.status === 1)
    if (filter === 'unpaid') return bills.filter(b => b.status !== 1)
    return bills
  }, [bills, filter])

  const totalRevenue = useMemo(
    () => bills.filter(b => b.status === 1).reduce((sum, b) => sum + b.totalPrice, 0),
    [bills]
  )
  const unpaidCount = useMemo(() => bills.filter(b => b.status !== 1).length, [bills])

  const visibleBills = filteredBills.slice(0, visibleCount)
  const hasMore = visibleCount < filteredBills.length

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setVisibleCount(PAGE_SIZE) // đổi bộ lọc thì hiển thị lại từ đầu
  }

  if (loading) return <p className="page">Đang tải...</p>

  return (
    <div className="page">
      <h1>Hóa đơn</h1>

      <div className="bill-summary">
        <div className="bill-summary-card">
          <span className="bill-summary-icon">🧾</span>
          <div>
            <div className="bill-summary-value">{bills.length}</div>
            <div className="bill-summary-label">Tổng hóa đơn</div>
          </div>
        </div>
        <div className="bill-summary-card highlight">
          <span className="bill-summary-icon">💰</span>
          <div>
            <div className="bill-summary-value">{totalRevenue.toLocaleString('vi-VN')} đ</div>
            <div className="bill-summary-label">Doanh thu đã thu</div>
          </div>
        </div>
        <div className="bill-summary-card warn">
          <span className="bill-summary-icon">⏳</span>
          <div>
            <div className="bill-summary-value">{unpaidCount}</div>
            <div className="bill-summary-label">Chưa thanh toán</div>
          </div>
        </div>
      </div>

      <div className="bill-filter-row">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>Tất cả</button>
        <button className={filter === 'paid' ? 'active' : ''} onClick={() => handleFilterChange('paid')}>Đã thanh toán</button>
        <button className={filter === 'unpaid' ? 'active' : ''} onClick={() => handleFilterChange('unpaid')}>Chưa thanh toán</button>
      </div>

      <table className="data-table bill-table">
        <thead>
          <tr><th>ID</th><th>Ngày vào</th><th>Trạng thái</th><th>Tổng tiền</th></tr>
        </thead>
        <tbody>
          {visibleBills.map(b => (
            <tr key={b.id}>
              <td>#{b.id}</td>
              <td>{new Date(b.dateCheckIn).toLocaleString('vi-VN')}</td>
              <td>
                <span className={`status-pill ${b.status === 1 ? 'paid' : 'unpaid'}`}>
                  {b.status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </td>
              <td className="bill-amount">{b.totalPrice.toLocaleString('vi-VN')} đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredBills.length === 0 && (
        <p className="bill-empty">Không có hóa đơn nào phù hợp.</p>
      )}

      {filteredBills.length > 0 && (
        <p className="load-more-info">Hiển thị {visibleBills.length} / {filteredBills.length} hóa đơn</p>
      )}

      {hasMore && (
        <button className="load-more-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
          Tải thêm
        </button>
      )}
    </div>
  )
}
export default Bills