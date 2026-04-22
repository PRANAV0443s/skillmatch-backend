export default function SkillBadge({ skill, variant = 'default' }) {
  const colors = {
    default: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  color: '#a5b4fc' },
    success:  { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    danger:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  color: '#fca5a5' },
    accent:   { bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)', color: '#67e8f9' },
  }
  const style = colors[variant] || colors.default

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.65rem',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontWeight: 600,
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      textTransform: 'lowercase',
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {skill}
    </span>
  )
}
