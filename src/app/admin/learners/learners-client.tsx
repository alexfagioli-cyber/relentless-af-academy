'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LearnerData {
  id: string
  displayName: string
  email: string
  tier: string | null
  completed: number
  total: number
  completionPct: number
  lastActive: string | null
  daysInactive: number
  streakCurrent: number
  streakLongest: number
  isAdmin: boolean
  motivation: string | null
}

interface Props {
  learners: LearnerData[]
}

function statusDotColour(days: number): string {
  if (days <= 3) return '#22C55E'   // green
  if (days <= 7) return '#E8C872'   // amber
  if (days <= 14) return '#EF4444'  // red
  return '#6B7280'                  // grey
}

function statusLabel(days: number): string {
  if (days <= 3) return 'Active'
  if (days <= 7) return 'Stalling'
  if (days <= 14) return 'Inactive'
  return 'Dormant'
}

function lastActiveText(lastActive: string | null, daysInactive: number): string {
  if (!lastActive) return 'Never'
  if (daysInactive === 0) return 'Today'
  if (daysInactive === 1) return '1d ago'
  return `${daysInactive}d ago`
}

export function LearnersClient({ learners }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingTier, setSavingTier] = useState<string | null>(null)
  const router = useRouter()

  async function handleTierOverride(learnerId: string, newTier: string) {
    setSavingTier(learnerId)
    const supabase = createClient()

    await supabase
      .from('learner_profiles')
      .update({ tier: newTier })
      .eq('id', learnerId)

    await supabase
      .from('learning_events')
      .insert({
        learner_id: learnerId,
        verb: 'skipped',
        object_type: 'module',
        object_id: learnerId,
        context: { reason: 'admin tier override', new_tier: newTier },
      })

    setSavingTier(null)
    router.refresh()
  }

  return (
    <div className="space-y-2 pb-4">
      {learners.map((l) => {
        const isExpanded = expandedId === l.id

        return (
          <div key={l.id}>
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : l.id)}
              className="w-full rounded-lg p-4 text-left transition-all"
              style={{
                backgroundColor: '#25253D',
                border: isExpanded ? '1px solid #E8C872' : '1px solid #363654',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Status dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusDotColour(l.daysInactive) }}
                  title={statusLabel(l.daysInactive)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>
                      {l.displayName}
                    </span>
                    {l.isAdmin && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                      >
                        admin
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs" style={{ color: '#D4D4E8' }}>
                    <span>{l.email}</span>
                    <span className="capitalize">{l.tier ?? '--'}</span>
                    <span>{l.completed} completed</span>
                    <span>{lastActiveText(l.lastActive, l.daysInactive)}</span>
                    <span>{l.streakCurrent}d streak</span>
                  </div>
                </div>

                <span className="text-xs flex-shrink-0" style={{ color: '#D4D4E8' }}>
                  {isExpanded ? '\u25BC' : '\u25B6'}
                </span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div
                className="rounded-b-lg p-4 -mt-1 space-y-4"
                style={{ backgroundColor: '#25253D', borderTop: '1px solid #363654' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="truncate">
                    <span style={{ color: '#6B7280' }}>Email: </span>
                    <span style={{ color: '#D4D4E8' }}>{l.email}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Completion: </span>
                    <span style={{ color: '#D4D4E8' }}>{l.completionPct}% ({l.completed}/{l.total})</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Best streak: </span>
                    <span style={{ color: '#D4D4E8' }}>{l.streakLongest}d</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Last active: </span>
                    <span style={{ color: '#D4D4E8' }}>
                      {l.lastActive
                        ? new Date(l.lastActive).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Never'}
                    </span>
                  </div>
                  {l.motivation && (
                    <div className="col-span-2">
                      <span style={{ color: '#6B7280' }}>Motivation: </span>
                      <span style={{ color: '#D4D4E8' }}>{l.motivation}</span>
                    </div>
                  )}
                </div>

                {/* Tier override */}
                <div>
                  <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>Tier override</label>
                  <select
                    value={l.tier ?? 'aware'}
                    onChange={(e) => handleTierOverride(l.id, e.target.value)}
                    disabled={savingTier === l.id}
                    className="rounded-md px-3 py-1.5 text-xs disabled:opacity-50"
                    style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
                  >
                    <option value="aware">Aware</option>
                    <option value="enabled">Enabled</option>
                    <option value="specialist">Specialist</option>
                  </select>
                  {savingTier === l.id && (
                    <span className="text-xs ml-2" style={{ color: '#D4D4E8' }}>Saving...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {learners.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>
          No learners yet.
        </p>
      )}
    </div>
  )
}
