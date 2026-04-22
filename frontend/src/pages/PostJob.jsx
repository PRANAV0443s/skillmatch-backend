import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { Save } from 'lucide-react'

export default function PostJob() {
  const navigate       = useNavigate()
  const { id: editId } = useParams()
  const isEdit         = Boolean(editId)

  const [form, setForm]   = useState({ title: '', description: '', company: '', location: '', requiredSkills: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isEdit) {
      jobService.getById(editId).then((job) => {
        setForm({
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          requiredSkills: job.requiredSkills?.join(', ') || '',
        })
      }).catch(() => setError('Could not load job for editing.'))
    }
  }, [editId, isEdit])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      ...form,
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    }

    try {
      if (isEdit) {
        await jobService.update(editId, payload)
      } else {
        await jobService.create(payload)
      }
      navigate('/recruiter')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 className="page-title">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        <p className="page-subtitle">Fill in the details below to {isEdit ? 'update' : 'publish'} your job listing.</p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input id="job-title" className="form-input" name="title" placeholder="e.g. Frontend Developer" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input id="job-company" className="form-input" name="company" placeholder="e.g. Acme Corp" value={form.company} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input id="job-location" className="form-input" name="location" placeholder="e.g. Bangalore / Remote" value={form.location} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea id="job-desc" className="form-textarea" name="description" placeholder="Describe the role, responsibilities, and requirements…" value={form.description} onChange={handleChange} rows={5} required />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input
                id="job-skills"
                className="form-input"
                name="requiredSkills"
                placeholder="e.g. react, node.js, mongodb, docker"
                value={form.requiredSkills}
                onChange={handleChange}
              />
              <small style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                Comma-separated list of skills the AI will match against.
              </small>
            </div>

            <button id="save-job-btn" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Saving…' : <><Save size={16} /> {isEdit ? 'Update Job' : 'Publish Job'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
