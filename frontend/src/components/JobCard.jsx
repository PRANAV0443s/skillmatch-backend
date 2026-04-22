import { useNavigate } from 'react-router-dom'
import { MapPin, Building2, Clock, ChevronRight } from 'lucide-react'
import SkillBadge from './SkillBadge'
import MatchScoreRing from './MatchScoreRing'
import './JobCard.css'

export default function JobCard({ job, matchScore, showScore = false }) {
  const navigate = useNavigate()

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently'
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  return (
    <div className="job-card fade-up" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card-header">
        <div className="job-logo">
          {job.company?.[0]?.toUpperCase() || 'J'}
        </div>
        <div className="job-meta">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-company">
            <Building2 size={13} />
            <span>{job.company}</span>
          </div>
        </div>
        {showScore && matchScore !== undefined && (
          <MatchScoreRing score={matchScore} size={56} />
        )}
      </div>

      <p className="job-desc">
        {job.description?.length > 110
          ? job.description.slice(0, 110) + '…'
          : job.description}
      </p>

      <div className="job-skills">
        {job.requiredSkills?.slice(0, 4).map((s) => (
          <SkillBadge key={s} skill={s} />
        ))}
        {job.requiredSkills?.length > 4 && (
          <span className="skills-more">+{job.requiredSkills.length - 4}</span>
        )}
      </div>

      <div className="job-footer">
        <div className="job-location">
          <MapPin size={13} />
          <span>{job.location || 'Remote'}</span>
        </div>
        <div className="job-time">
          <Clock size={13} />
          <span>{timeAgo(job.createdAt)}</span>
        </div>
        <button className="btn btn-primary btn-sm job-apply-btn">
          View <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
