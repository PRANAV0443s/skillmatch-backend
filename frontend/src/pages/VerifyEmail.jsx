import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react'
import './Auth.css'

export default function VerifyEmail() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const email = location.state?.email || ''
  const name  = location.state?.name  || ''

  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputRefs = useRef([])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // digits only
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the full 6-digit code.'); return }

    setError('')
    setLoading(true)
    try {
      const data = await authService.verifyEmail(email, code)
      if (data.verified && data.token) {
        login(data)
        setSuccess('Email verified! Redirecting…')
        const routes = { STUDENT: '/dashboard', RECRUITER: '/recruiter', ADMIN: '/admin' }
        setTimeout(() => navigate(routes[data.role] || '/jobs'), 800)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    setError('')
    try {
      await authService.resendOtp(email)
      setSuccess('New code sent! Check your email.')
      setCooldown(60)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)' }}>
            <ShieldCheck size={24} />
          </div>
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to<br />
            <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify}>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            id="verify-submit"
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            style={{ marginTop: '1.5rem' }}
          >
            {loading ? 'Verifying…' : <><ShieldCheck size={18} /> Verify Email</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resending
                ? 'Sending…'
                : "Didn't get it? Resend code"}
          </button>
        </div>

        <p className="auth-footer">
          <Link to="/register" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={14} /> Back to Register
          </Link>
        </p>
      </div>
    </div>
  )
}
