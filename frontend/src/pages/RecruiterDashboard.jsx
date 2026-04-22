import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { applicationService } from '../services/applicationService'
import ApplicationTable from '../components/ApplicationTable'
import { PlusCircle, Trash2 } from 'lucide-react'

export default function RecruiterDashboard() {
  const [jobs, setJobs]                   = useState([])
  const [selectedJob, setSelectedJob]     = useState(null)
  const [applications, setApplications]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [appsLoading, setAppsLoading]     = useState(false)

  useEffect(() => {
    jobService.getMyJobs()
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const viewApplications = async (job) => {
    setSelectedJob(job)
    setAppsLoading(true)
    try {
      const apps = await applicationService.getJobApplications(job.id)
      setApplications(apps)
    } catch { setApplications([]) }
    finally { setAppsLoading(false) }
  }

  const handleStatusChange = async (appId, status) => {
    try {
      const updated = await applicationService.updateStatus(appId, status)
      setApplications((prev) => prev.map((a) => a.id === appId ? updated : a))
    } catch {}
  }

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting?')) return
    try {
      await jobService.delete(jobId)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      if (selectedJob?.id === jobId) { setSelectedJob(null); setApplications([]) }
    } catch {}
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Recruiter Dashboard</h1>
            <p className="page-subtitle">Manage your job postings and applications</p>
          </div>
          <Link to="/recruiter/post-job" className="btn btn-primary">
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card"><div className="stat-value">{jobs.length}</div><div className="stat-label">Active Jobs</div></div>
          <div className="stat-card"><div className="stat-value">{applications.length}</div><div className="stat-label">Applications</div></div>
          <div className="stat-card">
            <div className="stat-value">{applications.filter((a) => a.status === 'SHORTLISTED').length}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        {/* My Jobs */}
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>My Job Postings</h2>
        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p><Link to="/recruiter/post-job" style={{ color: 'var(--color-primary)' }}>Post your first job</Link></p>
            </div>
          ) : (
            <div className="card table-wrap" style={{ padding: 0, marginBottom: '2rem' }}>
              <table className="table">
                <thead>
                  <tr><th>Title</th><th>Location</th><th>Skills</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>{j.title}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{j.location}</td>
                      <td>{j.requiredSkills?.slice(0, 3).join(', ')}{j.requiredSkills?.length > 3 ? '…' : ''}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => viewApplications(j)}>
                            View Apps
                          </button>
                          <Link to={`/recruiter/edit-job/${j.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteJob(j.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Applications Panel */}
        {selectedJob && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Applications for: {selectedJob.title}</h2>
            {appsLoading ? <div className="loading-page"><div className="spinner" /></div> : (
              <ApplicationTable
                applications={applications}
                jobs={{ [selectedJob.id]: selectedJob }}
                onStatusChange={handleStatusChange}
                isRecruiter
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
