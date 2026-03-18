import { BADGE_DEFINITIONS } from '@/lib/badges'

interface Props {
  earnedKeys: string[]
}

export function BadgeWall({ earnedKeys }: Props) {
  const earnedSet = new Set(earnedKeys)

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
      <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: '#D4D4E8' }}>
        Badges
      </p>
      <div className="grid grid-cols-4 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = earnedSet.has(badge.key)
          return (
            <div key={badge.key} className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-1 transition-all"
                style={{
                  backgroundColor: isEarned ? '#25253D' : '#1A1A2E',
                  border: `2px solid ${isEarned ? badge.colour : '#363654'}`,
                  boxShadow: isEarned ? `0 0 12px ${badge.colour}40` : 'none',
                  opacity: isEarned ? 1 : 0.4,
                }}
              >
                {badge.emoji}
              </div>
              <p className="text-[10px] leading-tight" style={{ color: isEarned ? '#E8F0FE' : '#6B7280' }}>
                {badge.name}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
