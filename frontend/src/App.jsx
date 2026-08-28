import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Foods from './pages/Foods'
import Categories from './pages/Categories'
import Tables from './pages/Tables'
import Bills from './pages/Bills'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/bills" element={<Bills />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App