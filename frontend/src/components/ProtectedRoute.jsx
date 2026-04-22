import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    // Redirect each role to its home
    const roleHome = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
    return <Navigate to={roleHome[user.role] || '/'} replace />
  }

  return children
}
