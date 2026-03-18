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
  weeklyTime: string | null
  primaryGoal: string | null
  motivation: string | null
  attempts: { assessment_title: string; score: number; passed: boolean; attempted_at: string }[]
  onboarding: { question_key: string; response: Record<string, unknown> }[]
}

interface InviteData {
  id: string
  email: string
  status: string
  expiresAt: string
  createdAt: string
}

interface Summary {
  totalLearners: number
  avgCompletion: number
  avgStreak: number
  mostCommonTier: string
  tierCounts: { aware: number; enabled: number; specialist: number }
}

interface Props {
  learners: LearnerData[]
  invites: InviteData[]
  summary: Summary
}

function statusColour(days: number): string {
  if (days <= 3) return '#22C55E'   // green
  if (days <= 7) return '#F59E0B'   // amber
  if (days <= 14) return '#DC2626'  // red
  return '#6B7280'                  // grey
}

function statusLabel(days: number): string {
  if (days <= 3) return 'Active'
  if (days <= 7) return 'Stalling'
  if (days <= 14) return 'Inactive'
  return 'Dormant'
}

export function AdminDashboardClient({ learners, invites, summary }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviteLoading(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setInviteSuccess(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      router.refresh()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleTierOverride(learnerId: string, newTier: string) {
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
        object_id: learnerId, // reference to the learner
        context: { reason: 'admin tier override', new_tier: newTier },
      })

    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* c) Progress Overview */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
          Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Learners" value={summary.totalLearners} />
          <StatCard label="Avg Completion" value={`${summary.avgCompletion}%`} />
          <StatCard label="Common Tier" value={summary.mostCommonTier} capitalize />
          <StatCard label="Avg Streak" value={`${summary.avgStreak}d`} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatCard label="Aware" value={summary.tierCounts.aware} />
          <StatCard label="Enabled" value={summary.tierCounts.enabled} />
          <StatCard label="Specialist" value={summary.tierCounts.specialist} />
        </div>
      </section>

      {/* a) Learner Table */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
          Learners
        </h2>
        <div className="space-y-2">
          {learners.map((l) => (
            <div key={l.id}>
              <button
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                className="w-full rounded-lg p-4 text-left transition-all"
                style={{ backgroundColor: '#1E293B', border: expandedId === l.id ? '1px solid #DC2626' : '1px solid #374151' }}
              >
                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColour(l.daysInactive) }}
                    title={statusLabel(l.daysInactive)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: '#F9FAFB' }}>
                        {l.displayName}
                      </span>
                      {l.isAdmin && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}>
                          admin
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs" style={{ color: '#6B7280' }}>
                      <span className="capitalize">{l.tier ?? '—'}</span>
                      <span>{l.completed}/{l.total} done</span>
                      <span>{l.streakCurrent}d streak</span>
                    </div>
                  </div>

                  <span className="text-xs" style={{ color: '#6B7280' }}>
                    {expandedId === l.id ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === l.id && (
                <div className="rounded-b-lg p-4 -mt-1 space-y-4" style={{ backgroundColor: '#1E293B', borderTop: '1px solid #374151' }}>
                  {/* Basic info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: '#6B7280' }}>Email: </span>
                      <span style={{ color: '#9CA3AF' }}>{l.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>Last active: </span>
                      <span style={{ color: '#9CA3AF' }}>
                        {l.lastActive ? `${l.daysInactive}d ago` : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>Completion: </span>
                      <span style={{ color: '#9CA3AF' }}>{l.completionPct}%</span>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>Best streak: </span>
                      <span style={{ color: '#9CA3AF' }}>{l.streakLongest}d</span>
                    </div>
                    {l.weeklyTime && (
                      <div>
                        <span style={{ color: '#6B7280' }}>Weekly time: </span>
                        <span style={{ color: '#9CA3AF' }}>{l.weeklyTime}</span>
                      </div>
                    )}
                    {l.motivation && (
                      <div className="col-span-2">
                        <span style={{ color: '#6B7280' }}>Motivation: </span>
                        <span style={{ color: '#9CA3AF' }}>{l.motivation}</span>
                      </div>
                    )}
                  </div>

                  {/* d) Tier override */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>Tier override</label>
                    <select
                      value={l.tier ?? 'aware'}
                      onChange={(e) => handleTierOverride(l.id, e.target.value)}
                      className="rounded-md px-3 py-1.5 text-xs"
                      style={{ backgroundColor: '#111827', color: '#F9FAFB', border: '1px solid #374151' }}
                    >
                      <option value="aware">Aware</option>
                      <option value="enabled">Enabled</option>
                      <option value="specialist">Specialist</option>
                    </select>
                  </div>

                  {/* Assessment attempts */}
                  {l.attempts.length > 0 && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Assessment attempts</p>
                      <div className="space-y-1">
                        {l.attempts.slice(0, 5).map((a, i) => (
                          <div key={i} className="flex justify-between text-xs rounded px-2 py-1" style={{ backgroundColor: '#111827' }}>
                            <span style={{ color: '#9CA3AF' }}>{a.assessment_title}</span>
                            <span style={{ color: a.passed ? '#22C55E' : '#DC2626' }}>
                              {Math.round(a.score)}% — {a.passed ? 'Pass' : 'Fail'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Onboarding responses */}
                  {l.onboarding.length > 0 && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Onboarding responses</p>
                      <div className="space-y-1">
                        {l.onboarding.map((o, i) => (
                          <div key={i} className="text-xs rounded px-2 py-1" style={{ backgroundColor: '#111827' }}>
                            <span style={{ color: '#6B7280' }}>{o.question_key}: </span>
                            <span style={{ color: '#9CA3AF' }}>{JSON.stringify(o.response)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {learners.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: '#6B7280' }}>No learners yet</p>
          )}
        </div>
      </section>

      {/* b) Invite Management */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
          Invites
        </h2>

        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #374151' }}
          />
          <button
            type="submit"
            disabled={inviteLoading || !inviteEmail.trim()}
            className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
          >
            {inviteLoading ? '...' : 'Send Invite'}
          </button>
        </form>

        {inviteError && (
          <p className="text-xs mb-3" style={{ color: '#DC2626' }}>{inviteError}</p>
        )}
        {inviteSuccess && (
          <p className="text-xs mb-3" style={{ color: '#22C55E' }}>{inviteSuccess}</p>
        )}

        <div className="space-y-2">
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-md px-3 py-2 text-xs" style={{ backgroundColor: '#1E293B' }}>
              <span style={{ color: '#9CA3AF' }}>{inv.email}</span>
              <span style={{
                color: inv.status === 'accepted' ? '#22C55E' : inv.status === 'expired' ? '#DC2626' : '#F59E0B'
              }}>
                {inv.status}
              </span>
            </div>
          ))}
          {invites.length === 0 && (
            <p className="text-sm text-center py-2" style={{ color: '#6B7280' }}>No invites sent yet</p>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, capitalize }: { label: string; value: string | number; capitalize?: boolean }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: '#1E293B' }}>
      <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>{label}</p>
      <p className={`mt-1 text-lg font-semibold ${capitalize ? 'capitalize' : ''}`} style={{ color: '#F9FAFB' }}>
        {value}
      </p>
    </div>
  )
}
