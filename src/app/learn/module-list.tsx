'use client'

import { useState } from 'react'
import Link from 'next/link'

type ModuleStatus = 'completed' | 'in_progress' | 'available' | 'locked'

interface ModuleItem {
  id: string
  title: string
  module_type: string
  estimated_duration_mins: number | null
  platform: string | null
  status: ModuleStatus
}

interface TierGroup {
  tier: string
  label: string
  modules: ModuleItem[]
}

const TYPE_ICONS: Record<string, string> = {
  course: '📖',
  challenge: '⚡',
  assessment: '✅',
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function ModuleList({ groups }: { groups: TierGroup[] }) {
  const [showLocked, setShowLocked] = useState(false)

  const lockedCount = groups.reduce(
    (sum, g) => sum + g.modules.filter((m) => m.status === 'locked').length,
    0,
  )

  return (
    <>
      {groups.map(({ tier, label, modules }) => {
        const visible = showLocked
          ? modules
          : modules.filter((m) => m.status !== 'locked')

        if (visible.length === 0) return null

        return (
          <div key={tier} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4D4E8' }}>
              {label} Tier
            </h2>
            <div className="space-y-3">
              {visible.map((mod) => {
                const isLocked = mod.status === 'locked'
                const borderColor =
                  mod.status === 'completed' ? '#22C55E' :
                  mod.status === 'available' || mod.status === 'in_progress' ? '#E8C872' :
                  '#374151'

                const card = (
                  <div
                    className="rounded-lg p-4 transition-all"
                    style={{
                      backgroundColor: '#25253D',
                      border: `1px solid ${borderColor}`,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-lg flex-shrink-0">
                        {mod.status === 'completed' && <span style={{ color: '#22C55E' }}>✓</span>}
                        {mod.status === 'in_progress' && <span>▶</span>}
                        {mod.status === 'available' && <span>{TYPE_ICONS[mod.module_type] ?? '📖'}</span>}
                        {mod.status === 'locked' && <span style={{ color: '#6B7280' }}>🔒</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                          {mod.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs" style={{ color: '#D4D4E8' }}>
                            {mod.module_type}
                          </span>
                          {mod.estimated_duration_mins && (
                            <span className="text-xs" style={{ color: '#6B7280' }}>
                              {formatDuration(mod.estimated_duration_mins)}
                            </span>
                          )}
                          {mod.platform && mod.platform !== 'internal' && (
                            <span className="text-xs" style={{ color: '#6B7280' }}>
                              {mod.platform}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )

                if (isLocked) return <div key={mod.id}>{card}</div>
                return <Link key={mod.id} href={`/learn/${mod.id}`}>{card}</Link>
              })}
            </div>
          </div>
        )
      })}

      {lockedCount > 0 && (
        <button
          onClick={() => setShowLocked(!showLocked)}
          className="w-full text-center text-sm py-3 rounded-lg transition-all"
          style={{ color: '#D4D4E8', backgroundColor: '#25253D', border: '1px solid #363654' }}
        >
          {showLocked
            ? 'Hide locked modules'
            : `Show ${lockedCount} locked module${lockedCount !== 1 ? 's' : ''}`}
        </button>
      )}
    </>
  )
}
