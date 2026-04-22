import { useState, useEffect } from 'react'
import { jobService } from '../services/jobService'
import JobCard from '../components/JobCard'
import { Search } from 'lucide-react'

export default function Jobs() {
  const [jobs, setJobs]       = useState([])
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    jobService.getAll()
      .then(setJobs)
      .catch(() => setError('Failed to load jobs.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter((j) =>
    j.title?.toLowerCase().includes(query.toLowerCase()) ||
    j.company?.toLowerCase().includes(query.toLowerCase()) ||
    j.requiredSkills?.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Browse Jobs</h1>
        <p className="page-subtitle">{jobs.length} opportunities available</p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 480, marginBottom: '2rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            id="job-search"
            className="form-input"
            placeholder="Search by title, company, or skill…"
            style={{ paddingLeft: '2.8rem' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : filtered.length ? (
          <div className="grid-2">
            {filtered.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
