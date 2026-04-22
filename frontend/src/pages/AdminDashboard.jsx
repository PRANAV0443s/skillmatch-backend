import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { Users, Briefcase, FileText, CheckCircle } from 'lucide-react'

const TABS = ['Overview', 'Users', 'Jobs', 'Applications']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, j, a] = await Promise.all([
          adminService.getStats(),
          adminService.getAllUsers(),
          adminService.getAllJobs(),
          adminService.getAllApplications(),
        ])
        setStats(s); setUsers(u); setJobs(j); setApps(a)
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Full oversight of the SkillMatch platform</p>

        {/* Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: <Users size={22} /> },
            { label: 'Total Jobs', value: stats?.totalJobs, icon: <Briefcase size={22} /> },
            { label: 'Total Applications', value: stats?.totalApplications, icon: <FileText size={22} /> },
            { label: 'Shortlisted', value: stats?.shortlisted, icon: <CheckCircle size={22} /> },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div className="stat-value">{s.value ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          {TABS.map((t) => (
            <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'Overview' && (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Application Status Breakdown</h3>
              {['applied', 'shortlisted', 'rejected'].map((s) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{s}</span>
                  <strong>{stats?.[s] ?? 0}</strong>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Platform Summary</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {stats?.totalUsers} registered users · {stats?.totalJobs} active job postings · {stats?.totalApplications} applications submitted.
              </p>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'Users' && (
          <div className="table-wrap card" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Skills</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td><span className="status-badge status-applied">{u.role}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{u.skills?.slice(0, 3).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs tab */}
        {tab === 'Jobs' && (
          <div className="table-wrap card" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Skills</th></tr></thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{j.company}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{j.location}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{j.requiredSkills?.slice(0, 3).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Applications tab */}
        {tab === 'Applications' && (
          <div className="table-wrap card" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>User ID</th><th>Job ID</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{a.userId?.slice(-6)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{a.jobId?.slice(-6)}</td>
                    <td style={{ fontWeight: 700, color: a.matchScore >= 70 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{a.matchScore}%</td>
                    <td><span className={`status-badge status-${a.status?.toLowerCase()}`}>{a.status}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
