import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Pages/Navbar'
import Home from './Pages/Home'
import About from './Pages/About'
import Admin from './Pages/Admin'
import Login from './Pages/Login'
import Footer from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import Register from './Pages/Register'
import './App.css'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-animation transition-colors duration-300">
        <Navbar />
        <main className="flex-grow pt-16 container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
