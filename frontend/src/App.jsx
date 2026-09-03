import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Foods from './pages/Foods'
import Categories from './pages/Categories'
import Tables from './pages/Tables'
import Bills from './pages/Bills'
import Login from './pages/Login'
import './App.css'
import TableDetail from './pages/TableDetail'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/tables" element={<Tables />} />
              <Route
                path="/bills"
                element={
                  <ProtectedRoute>
                    <Bills />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/tables/:id"
  element={
    <ProtectedRoute>
      <TableDetail />
    </ProtectedRoute>
  }
/>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App