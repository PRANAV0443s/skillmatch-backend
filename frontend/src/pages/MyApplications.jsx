import { useState, useEffect } from 'react'
import { applicationService } from '../services/applicationService'
import { jobService } from '../services/jobService'
import ApplicationTable from '../components/ApplicationTable'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [jobsMap, setJobsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await applicationService.getMyApplications()
        setApplications(apps)

        // Fetch job details for each application
        const ids = [...new Set(apps.map((a) => a.jobId))]
        const jobs = await Promise.all(ids.map((id) => jobService.getById(id).catch(() => null)))
        const map = {}
        jobs.forEach((j) => { if (j) map[j.id] = j })
        setJobsMap(map)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track all your job applications in one place</p>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <ApplicationTable applications={applications} jobs={jobsMap} />
        )}
      </div>
    </div>
  )
}
