import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { token, setToken, userRole } = useAuth()
  const navigate = useNavigate()

  const handleClose = () => setIsOpen(false)

  const handleLogout = () => {
    setToken(null)
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 w-full h-[10vh] bg-gradient-to-r from-black via-gray-900 to-black shadow-[0_4px_15px_rgba(0,0,0,0.3)] z-50 px-8 py-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-4xl font-bold animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                Ratthi's{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500">
                  Arts
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            {userRole === 'ADMIN' && (
              <NavLink to="/admin">Post</NavLink>
            )}
            {token ? (
              <button
                onClick={handleLogout}
                className="relative text-gray-300 text-xl font-medium transition-all duration-300 transform hover:scale-125 group"
              >
                <span className="bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-300 group-hover:to-gray-100 transition-all duration-300">
                  Logout
                </span>
              </button>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className={`md:hidden ${isOpen ? 'active' : ''}`}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 hover:text-gray-300 transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="h-8 w-8" />
              ) : (
                <Bars3Icon className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Fixed positioning and gap issues */}
      <div 
        className={`fixed top-[10vh] left-0 right-0 transition-all duration-300 z-40 ${
          isOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="w-full min-h-[90vh] bg-gradient-to-b from-black via-gray-900/98 to-black border-t border-gray-800 py-4 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center space-y-6 pt-4">
            <MobileNavLink to="/" onClick={handleClose}>Home</MobileNavLink>
            <MobileNavLink to="/about" onClick={handleClose}>About</MobileNavLink>
            {userRole === 'ADMIN' && (
              <MobileNavLink to="/admin" onClick={handleClose}>Post</MobileNavLink>
            )}
            {token ? (
              <button
                onClick={() => {
                  handleLogout();
                  handleClose();
                }}
                className="relative text-gray-300 text-xl font-medium transition-all duration-300 transform hover:scale-125 group"
              >
                <span className="bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-300 group-hover:to-gray-100 transition-all duration-300">
                  Logout
                </span>
              </button>
            ) : (
              <MobileNavLink to="/login" onClick={handleClose}>Login</MobileNavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Helper Components for Navigation Links
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="relative text-gray-300 text-xl font-medium transition-all duration-300 transform hover:scale-125 group"
  >
    <span className="bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-300 group-hover:to-gray-100 transition-all duration-300">
      {children}
    </span>
  </Link>
)

const MobileNavLink = ({ 
  to, 
  children, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="relative text-gray-300 text-xl font-medium transition-all duration-300 transform hover:scale-125 group"
  >
    <span className="bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-300 group-hover:to-gray-100 transition-all duration-300">
      {children}
    </span>
  </Link>
)
