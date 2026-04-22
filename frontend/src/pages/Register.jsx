import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { UserPlus } from 'lucide-react'
import { auth, googleProvider, signInWithPopup } from '../firebase'
import './Auth.css'

const ROLES = [
  { value: 'STUDENT',   label: '🎓 Student – Browse & apply for jobs' },
  { value: 'RECRUITER', label: '💼 Recruiter – Post jobs & manage applications' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── Email / Password Register ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const payload = { ...form, email: form.email.toLowerCase().trim() }
      const data = await authService.register(payload)

      if (data.verified === false) {
        navigate('/verify-email', { state: { email: payload.email, name: payload.name } })
      } else if (data.token) {
        login(data)
        const routes = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
        navigate(routes[data.role] || '/jobs')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign-Up (Firebase signInWithPopup) ──────────────
  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      // Pass selected role so backend knows what role to assign new Google users
      const data = await authService.googleLogin(idToken, form.role)
      login(data)
      const routes = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
      navigate(routes[data.role] || '/jobs')
    } catch (err) {
      const code = err.code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed popup — not an error
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.')
      } else {
        setError(err.response?.data?.message || 'Google Sign-Up failed. Please try again.')
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join SkillMatch and find your perfect job</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" className="form-input" type="text" name="name"
              placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="form-input" type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="form-input" type="password" name="password"
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div className="role-select">
              {ROLES.map((r) => (
                <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="role" value={r.value}
                    checked={form.role === r.value} onChange={handleChange} style={{ display: 'none' }} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <button id="register-submit" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-separator">
          <span>OR</span>
        </div>

        {/* Role hint for Google sign-up */}
        <p className="auth-google-role-hint">
          Signing up as: <strong>{form.role === 'STUDENT' ? '🎓 Student' : '💼 Recruiter'}</strong>
          &nbsp;·&nbsp;
          <button
            type="button"
            className="auth-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}
            onClick={() => setForm(f => ({ ...f, role: f.role === 'STUDENT' ? 'RECRUITER' : 'STUDENT' }))}
          >
            Switch
          </button>
        </p>

        {/* Custom Firebase Google Sign-In button */}
        <button
          id="google-register-btn"
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
          {googleLoading ? 'Signing up…' : 'Sign up with Google'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
