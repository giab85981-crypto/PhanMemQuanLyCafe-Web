import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5142/api',
})

// Interceptor: tự động gắn "Authorization: Bearer <token>" nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('auth')
  if (saved) {
    const { token } = JSON.parse(saved)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: nếu token hết hạn/không hợp lệ (401) -> tự động đăng xuất
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api