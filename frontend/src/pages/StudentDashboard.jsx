import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services/jobService'
import { applicationService } from '../services/applicationService'
import JobCard from '../components/JobCard'
import ResumeUploader from '../components/ResumeUploader'
import SkillBadge from '../components/SkillBadge'
import { Upload, Briefcase, Star } from 'lucide-react'

export default function StudentDashboard() {
  const { user, updateUser } = useAuth()
  const [recommended, setRecommended] = useState([])
  const [resumeFile, setResumeFile]   = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadMsg, setUploadMsg]     = useState('')
  const [loading, setLoading]         = useState(true)

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const data = await jobService.getRecommended()
      setRecommended(data)
    } catch {
      // quiet fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const handleUpload = async () => {
    if (!resumeFile) return
    setUploading(true)
    setUploadMsg('')
    try {
      const updatedUser = await applicationService.uploadResume(resumeFile)
      // updatedUser now contains the full profile with detected skills
      updateUser(updatedUser)
      setUploadMsg('✔ Resume uploaded successfully!')
      setResumeFile(null)
      // Refresh recommendations to match new skills
      fetchRecommendations()
    } catch {
      setUploadMsg('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your personalised job dashboard</p>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{user?.skills?.length || 0}</div>
            <div className="stat-label">Skills Detected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{recommended.length}</div>
            <div className="stat-label">Recommended Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user?.resumeUrl ? '✔' : '—'}</div>
            <div className="stat-label">Resume Uploaded</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Resume Upload */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={18} color="var(--color-primary)" /> Resume
            </h2>
            <ResumeUploader onFileSelect={setResumeFile} />
            {uploadMsg && (
              <div className={`alert ${uploadMsg.startsWith('✔') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.75rem' }}>
                {uploadMsg}
              </div>
            )}
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '1rem' }}
              onClick={handleUpload}
              disabled={!resumeFile || uploading}
            >
              {uploading ? 'Uploading…' : 'Upload & Analyze'}
            </button>
          </div>

          {/* Your Skills */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} color="var(--color-primary)" /> Detected Skills
            </h2>
            {user?.skills?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skills.map((s) => <SkillBadge key={s} skill={s} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Upload your resume to automatically detect your skills.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={20} color="var(--color-primary)" /> Recommended for You
        </h2>
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : recommended.length ? (
          <div className="grid-2">
            {recommended.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No recommendations yet</h3>
            <p>Upload a resume to get personalised job matches.</p>
          </div>
        )}
      </div>
    </div>
  )
}
