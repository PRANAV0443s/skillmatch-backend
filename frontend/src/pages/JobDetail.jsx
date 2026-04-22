import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services/jobService'
import { applicationService } from '../services/applicationService'
import SkillBadge from '../components/SkillBadge'
import ResumeUploader from '../components/ResumeUploader'
import { MapPin, Building2, ArrowLeft, Send } from 'lucide-react'

export default function JobDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [resumeFile, setResumeFile] = useState(null)
  const [applying, setApplying]     = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    jobService.getById(id)
      .then(setJob)
      .catch(() => setError('Job not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!resumeFile) { setError('Please select your resume PDF first.'); return }
    setApplying(true); setError('')
    try {
      const app = await applicationService.apply(id, resumeFile)
      setResult(app)
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!job)    return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 820 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {job.company?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{job.title}</h1>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building2 size={14} />{job.company}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} />{job.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <h3 style={{ fontWeight: 700, marginBottom: '0.6rem' }}>About this role</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{job.description}</p>

          {/* Required Skills */}
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Required Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.requiredSkills?.map((s) => <SkillBadge key={s} skill={s} />)}
          </div>
        </div>

        {/* Apply Section (students only) */}
        {user?.role === 'STUDENT' && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Apply for this Job</h2>

            {result ? (
              <div className="alert alert-success">
                ✔ Application submitted! Your match score: <strong>{result.matchScore}%</strong>
              </div>
            ) : (
              <>
                {error && <div className="alert alert-error">{error}</div>}
                <ResumeUploader onFileSelect={setResumeFile} label="Attach your resume (PDF)" />
                <button
                  id="apply-btn"
                  className="btn btn-primary btn-lg"
                  style={{ marginTop: '1rem' }}
                  onClick={handleApply}
                  disabled={applying || !resumeFile}
                >
                  {applying ? 'Submitting…' : <><Send size={16} /> Submit Application</>}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
