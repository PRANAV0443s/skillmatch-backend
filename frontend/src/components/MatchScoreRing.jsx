export default function MatchScoreRing({ score = 0, size = 80 }) {
  const radius      = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset      = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#6366f1' :
    score >= 25 ? '#f59e0b' :
                  '#ef4444'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      {/* Label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: size * 0.14, color: 'var(--color-text-dim)', marginTop: 2 }}>%</span>
      </div>
    </div>
  )
}
