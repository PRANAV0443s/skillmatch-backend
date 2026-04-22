import MatchScoreRing from './MatchScoreRing'

const STATUS_MAP = {
  APPLIED:     { label: 'Applied',     cls: 'status-applied' },
  VIEWED:      { label: 'Viewed',      cls: 'status-viewed' },
  SHORTLISTED: { label: 'Shortlisted', cls: 'status-shortlisted' },
  REJECTED:    { label: 'Rejected',    cls: 'status-rejected' },
}

export default function ApplicationTable({ applications, jobs = {}, onStatusChange, isRecruiter = false }) {
  if (!applications?.length) {
    return (
      <div className="empty-state">
        <h3>No applications yet</h3>
        <p>Applications will appear here once submitted.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap card" style={{ padding: 0 }}>
      <table className="table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Score</th>
            <th>Status</th>
            <th>Applied</th>
            {isRecruiter && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const job     = jobs[app.jobId]
            const status  = STATUS_MAP[app.status] || { label: app.status, cls: 'status-applied' }
            const date    = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'

            return (
              <tr key={app.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {job?.title || 'Job'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {job?.company || ''}
                  </div>
                </td>

                <td style={{ textAlign: 'center' }}>
                  <MatchScoreRing score={app.matchScore || 0} size={48} />
                </td>

                <td>
                  <span className={`status-badge ${status.cls}`}>{status.label}</span>
                </td>

                <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{date}</td>

                {isRecruiter && (
                  <td>
                    <select
                      defaultValue={app.status}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                      onChange={(e) => onStatusChange?.(app.id, e.target.value)}
                    >
                      {Object.keys(STATUS_MAP).map((s) => (
                        <option key={s} value={s}>{STATUS_MAP[s].label}</option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
