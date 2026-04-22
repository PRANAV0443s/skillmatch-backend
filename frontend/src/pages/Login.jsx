import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { LogIn } from 'lucide-react'
import { auth, googleProvider, signInWithPopup } from '../firebase'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── Email / Password Login ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, email: form.email.toLowerCase().trim() }
      const data = await authService.login(payload)

      if (data.verified === false) {
        navigate('/verify-email', { state: { email: payload.email, name: data.name } })
        return
      }

      login(data)
      const routes = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
      navigate(routes[data.role] || '/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign-In (Firebase signInWithPopup) ──────────────
  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      // Opens Google account picker popup — no redirect URI issues
      const result = await signInWithPopup(auth, googleProvider)
      // Get the Firebase ID token to send to our backend for verification
      const idToken = await result.user.getIdToken()
      const data = await authService.googleLogin(idToken, 'STUDENT')
      login(data)
      const routes = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
      navigate(routes[data.role] || '/jobs')
    } catch (err) {
      // Firebase error codes for user-friendly messages
      const code = err.code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed the popup — not an error
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.')
      } else {
        setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-logo">S</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your SkillMatch account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button id="login-submit" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="auth-separator">
          <span>OR</span>
        </div>

        {/* Custom Firebase Google Sign-In button */}
        <button
          id="google-login-btn"
          className="btn-google"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          type="button"
        >
          {googleLoading ? (
            <span className="btn-google-spinner" />
          ) : (
            <svg className="btn-google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  )
}
