interface ProgressRingProps {
  completed: number
  total: number
  size?: number
}

export function ProgressRing({ completed, total, size = 120 }: ProgressRingProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size, filter: 'drop-shadow(0 0 8px rgba(232, 200, 114, 0.2))' }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#363654"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8C872"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Centre text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${size <= 64 ? 'text-sm' : 'text-2xl'} font-bold`} style={{ color: '#FFFFFF' }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}
