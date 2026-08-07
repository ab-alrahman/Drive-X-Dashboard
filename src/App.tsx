import { Routes, Route } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VendorRegister from './pages/VendorRegister'
import Inventory from './pages/Inventory'
import CarDetail from './pages/CarDetail'
import Dashboard from './pages/Dashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import About from './pages/About'
import Contact from './pages/Contact'
import RequireAuth from './components/RequireAuth'
import { I18nProvider } from './lib/i18n'

export default function App() {
  return (
    <I18nProvider>
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/dashboard" element={<RequireAuth role="admin"><Dashboard /></RequireAuth>} />
          <Route path="/my-dashboard" element={<RequireAuth role="customer"><CustomerDashboard /></RequireAuth>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </I18nProvider>
  )
}
