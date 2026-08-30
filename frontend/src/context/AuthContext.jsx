import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Khi app khởi động, đọc lại thông tin đăng nhập đã lưu (nếu có)
  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  function login(loginResponse) {
    // loginResponse: { token, userName, displayName, type, role }
    localStorage.setItem('auth', JSON.stringify(loginResponse))
    setUser(loginResponse)
  }

  function logout() {
    localStorage.removeItem('auth')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}