import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './Home.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Chào buổi sáng'
  if (hour < 13) return 'Chào buổi trưa'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function isSameDay(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

const quickLinks = [
  { to: '/tables', label: 'Quản lý bàn', icon: '🪑', desc: 'Xem sơ đồ bàn, mở/đóng hóa đơn' },
  { to: '/foods', label: 'Món ăn', icon: '🍽️', desc: 'Danh sách món & giá bán' },
  { to: '/categories', label: 'Danh mục', icon: '🏷️', desc: 'Phân loại món theo nhóm' },
  { to: '/bills', label: 'Hóa đơn', icon: '🧾', desc: 'Lịch sử & trạng thái thanh toán' },
]

function Home() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    tablesEmpty: 0,
    tablesOccupied: 0,
    billsToday: 0,
    revenueToday: 0,
    foodsCount: 0,
  })

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      api.get('/TableFoods'),
      api.get('/Bills'),
      api.get('/Foods'),
    ]).then(([tablesRes, billsRes, foodsRes]) => {
      if (cancelled) return

      const tables = tablesRes.status === 'fulfilled' ? tablesRes.value.data : []
      const bills = billsRes.status === 'fulfilled' ? billsRes.value.data : []
      const foods = foodsRes.status === 'fulfilled' ? foodsRes.value.data : []

      const tablesEmpty = tables.filter(t => t.status === 'Trống').length
      const tablesOccupied = tables.length - tablesEmpty

      const billsTodayList = bills.filter(b => isSameDay(b.dateCheckIn))
      const revenueToday = billsTodayList
        .filter(b => b.status === 1)
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

      setStats({
        tablesEmpty,
        tablesOccupied,
        billsToday: billsTodayList.length,
        revenueToday,
        foodsCount: foods.length,
      })
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="home-hero-text">
          <div className="home-eyebrow">{today}</div>
          <h1 className="home-title">
            {getGreeting()}{user?.displayName ? `, ${user.displayName}` : ''} <span className="home-cup">☕</span>
          </h1>
          <p className="home-subtitle">
            Hệ thống quản lý quán cà phê — theo dõi bàn, món ăn và hóa đơn ngay tại đây.
          </p>
          {!user && (
            <Link to="/login" className="home-cta">Đăng nhập để bắt đầu →</Link>
          )}
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <div className="steam s1"></div>
          <div className="steam s2"></div>
          <div className="steam s3"></div>
          <div className="cup-body">
            <div className="cup-handle"></div>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-empty">🟢</div>
          <div className="stat-value">{loading ? '—' : stats.tablesEmpty}</div>
          <div className="stat-label">Bàn trống</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-occupied">🔴</div>
          <div className="stat-value">{loading ? '—' : stats.tablesOccupied}</div>
          <div className="stat-label">Bàn đang phục vụ</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">{loading ? '—' : stats.billsToday}</div>
          <div className="stat-label">Hóa đơn hôm nay</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-value">
            {loading ? '—' : `${stats.revenueToday.toLocaleString('vi-VN')} đ`}
          </div>
          <div className="stat-label">Doanh thu hôm nay</div>
        </div>
      </section>

      <section className="home-quicklinks">
        <h2 className="home-section-title">Truy cập nhanh</h2>
        <div className="quicklink-grid">
          {quickLinks.map(q => (
            <Link key={q.to} to={q.to} className="quicklink-card">
              <span className="quicklink-icon">{q.icon}</span>
              <div>
                <div className="quicklink-label">{q.label}</div>
                <div className="quicklink-desc">{q.desc}</div>
              </div>
              <span className="quicklink-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home