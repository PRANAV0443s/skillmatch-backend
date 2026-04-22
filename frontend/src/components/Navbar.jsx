import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Briefcase, LayoutDashboard, FileText, PlusCircle, ShieldCheck } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">S</div>
          <span>Skill<span className="brand-accent">Match</span></span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/jobs" className={isActive('/jobs')}>
                <Briefcase size={16} /> Jobs
              </Link>

              {user.role === 'STUDENT' && (
                <>
                  <Link to="/dashboard" className={isActive('/dashboard')}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/my-applications" className={isActive('/my-applications')}>
                    <FileText size={16} /> Applications
                  </Link>
                </>
              )}

              {user.role === 'RECRUITER' && (
                <>
                  <Link to="/recruiter" className={isActive('/recruiter')}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/recruiter/post-job" className={isActive('/recruiter/post-job')}>
                    <PlusCircle size={16} /> Post Job
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin" className={isActive('/admin')}>
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login"    className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* User Menu */}
        {user && (
          <div className="navbar-user">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="Avatar" className="user-avatar" style={{ border: 'none', objectFit: 'cover' }} />
            ) : (
              <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
            )}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
