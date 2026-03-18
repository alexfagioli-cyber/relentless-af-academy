import { createClient } from '@/lib/supabase/server'
import { computeUnlockedModules } from '@/lib/prerequisites'
import { getDashboardMessage } from '@/lib/dashboard-messages'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ProgressRing } from '@/components/ui/progress-ring'
import { getDailyTip } from '@/lib/daily-tips'
import Link from 'next/link'

const TIER_ORDER = ['aware', 'enabled', 'specialist'] as const
const TIER_COLOURS: Record<string, string> = {
  aware: '#F59E0B',
  enabled: '#DC2626',
  specialist: '#8B5CF6',
}
const MODULE_TYPE_ICONS: Record<string, string> = {
  course: '📖',
  challenge: '⚡',
  assessment: '📝',
}
const VERB_LABELS: Record<string, string> = {
  completed: 'Completed',
  started: 'Started',
  passed: 'Passed',
  failed: 'Attempted',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('display_name, tier, streak_current, occupation, learning_motivation, primary_goal')
    .eq('id', user?.id ?? '')
    .single()

  const learnerTier = profile?.tier ?? 'aware'
  const tierIndex = TIER_ORDER.indexOf(learnerTier as typeof TIER_ORDER[number])
  const visibleTiers = TIER_ORDER.slice(0, tierIndex + 1)

  // Get modules for visible tiers
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order_index, tier, module_type, estimated_duration_mins')
    .in('tier', visibleTiers)
    .order('order_index', { ascending: true })

  // Get prerequisites for these modules
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: prerequisites } = await supabase
    .from('prerequisites')
    .select('module_id, prerequisite_module_id, prerequisite_group')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['00000000-0000-0000-0000-000000000000'])

  // Get progress
  const { data: progress } = await supabase
    .from('progress')
    .select('module_id, status')
    .eq('learner_id', user?.id ?? '')

  const completedIds = new Set(
    (progress ?? []).filter((p) => p.status === 'completed').map((p) => p.module_id),
  )
  const inProgressIds = new Set(
    (progress ?? []).filter((p) => p.status === 'in_progress').map((p) => p.module_id),
  )
  const completedCount = completedIds.size
  const totalCount = moduleIds.length

  // Find in-progress module (resume) or next available
  const inProgressModule = (modules ?? []).find((m) => inProgressIds.has(m.id))
  const unlockedIds = computeUnlockedModules(moduleIds, prerequisites ?? [], completedIds)
  const nextModule = (modules ?? []).find(
    (m) => unlockedIds.has(m.id) && !completedIds.has(m.id),
  )
  const resumeModule = inProgressModule ?? nextModule

  // Tier progress
  const currentTierModules = (modules ?? []).filter((m) => m.tier === learnerTier)
  const currentTierCompleted = currentTierModules.filter((m) => completedIds.has(m.id)).length
  const currentTierTotal = currentTierModules.length
  const nextInTier = currentTierModules.find(
    (m) => unlockedIds.has(m.id) && !completedIds.has(m.id),
  )

  // Total time invested
  const totalMins = (modules ?? [])
    .filter((m) => completedIds.has(m.id))
    .reduce((sum, m) => sum + (m.estimated_duration_mins ?? 0), 0)
  const totalHours = Math.floor(totalMins / 60)
  const remainderMins = totalMins % 60

  // Recent activity
  const { data: recentEvents } = await supabase
    .from('learning_events')
    .select('verb, object_id, created_at')
    .eq('learner_id', user?.id ?? '')
    .in('verb', ['completed', 'started', 'passed', 'failed'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Map event object_ids to module titles
  const moduleMap = new Map((modules ?? []).map((m) => [m.id, m]))

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#E8F0FE' }}>
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          {(() => {
            const msg = getDashboardMessage({
              tier: profile?.tier ?? 'aware',
              occupation: profile?.occupation ?? null,
              learning_motivation: profile?.learning_motivation ?? null,
              primary_goal: profile?.primary_goal ?? null,
            })
            return (
              <p className="mt-1 text-sm" style={{ color: '#8BA3C4' }}>
                {msg.subtext}
              </p>
            )
          })()}
        </div>

        {/* Quick stats bar */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex-1 rounded-lg px-3 py-2 text-center"
            style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}
          >
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Time</p>
            <p className="text-sm font-semibold" style={{ color: '#E8F0FE' }}>
              {totalHours > 0 ? `${totalHours}h${remainderMins > 0 ? ` ${remainderMins}m` : ''}` : `${totalMins}m`}
            </p>
          </div>
          <div
            className="flex-1 rounded-lg px-3 py-2 text-center"
            style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}
          >
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Streak</p>
            <p className="text-sm font-semibold" style={{ color: '#E8F0FE' }}>
              {(profile?.streak_current ?? 0) > 0 ? `🔥 ${profile?.streak_current}d` : '0d'}
            </p>
          </div>
          <div
            className="flex-1 rounded-lg px-3 py-2 text-center"
            style={{ backgroundColor: '#122240', borderBottom: `2px solid ${TIER_COLOURS[learnerTier] ?? '#DC2626'}` }}
          >
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Tier</p>
            <p className="text-sm font-semibold capitalize" style={{ color: TIER_COLOURS[learnerTier] ?? '#E8F0FE' }}>
              {learnerTier}
            </p>
          </div>
        </div>

        {/* Progress ring + tier progress */}
        <div className="flex items-center gap-5 mb-6 rounded-lg p-4" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <ProgressRing completed={completedCount} total={totalCount} size={90} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#E8F0FE' }}>
              {currentTierCompleted} of {currentTierTotal} in {learnerTier.charAt(0).toUpperCase() + learnerTier.slice(1)}
            </p>
            {nextInTier && (
              <p className="mt-1 text-xs" style={{ color: '#8BA3C4' }}>
                Next up: {nextInTier.title}
              </p>
            )}
            {currentTierCompleted === currentTierTotal && currentTierTotal > 0 && (
              <p className="mt-1 text-xs font-semibold" style={{ color: '#22C55E' }}>
                Tier complete
              </p>
            )}
          </div>
        </div>

        {/* Continue / Resume card */}
        {resumeModule && completedCount === 0 ? (
          <Link
            href={`/learn/${resumeModule.id}`}
            className="block rounded-lg p-5 mb-4 transition-all"
            style={{ backgroundColor: '#122240', border: '1px solid #DC2626' }}
          >
            <p className="text-sm mb-2" style={{ color: '#8BA3C4' }}>
              Nothing started yet. That changes today.
            </p>
            <p className="text-base font-semibold" style={{ color: '#E8F0FE' }}>
              {MODULE_TYPE_ICONS[resumeModule.module_type] ?? ''} {resumeModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#DC2626' }}>
              Start →
            </p>
          </Link>
        ) : resumeModule ? (
          <Link
            href={`/learn/${resumeModule.id}`}
            className="block rounded-lg p-5 mb-4 transition-all"
            style={{ backgroundColor: '#122240', border: '1px solid #DC2626' }}
          >
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#8BA3C4' }}>
              {inProgressModule ? 'Continue where you left off' : 'Up next'}
            </p>
            <p className="text-base font-semibold" style={{ color: '#E8F0FE' }}>
              {MODULE_TYPE_ICONS[resumeModule.module_type] ?? ''} {resumeModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#DC2626' }}>
              {inProgressModule ? 'Resume →' : 'Start →'}
            </p>
          </Link>
        ) : completedCount === totalCount && totalCount > 0 ? (
          <div className="rounded-lg p-5 mb-4 text-center" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
            <p className="text-base font-semibold" style={{ color: '#22C55E' }}>
              All modules completed
            </p>
            <p className="mt-1 text-sm" style={{ color: '#8BA3C4' }}>
              You&apos;ve finished everything available in your tier. Extraordinary.
            </p>
          </div>
        ) : (
          <div className="rounded-lg p-5 mb-4 text-center" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
            <p className="text-sm" style={{ color: '#8BA3C4' }}>
              Complete your current modules to unlock the next step.
            </p>
          </div>
        )}

        {/* Daily tip */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#122240', borderLeft: '3px solid #DC2626' }}>
          <p className="text-sm" style={{ color: '#8BA3C4' }}>
            {getDailyTip()}
          </p>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Recent activity</p>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2">
              {recentEvents.map((event, i) => {
                const mod = moduleMap.get(event.object_id)
                const label = VERB_LABELS[event.verb] ?? event.verb
                const timeAgo = formatTimeAgo(event.created_at)
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <p style={{ color: '#D1D5DB' }}>
                      {label}{mod ? `: ${mod.title}` : ''}
                    </p>
                    <p style={{ color: '#6B7280' }}>{timeAgo}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Nothing here yet. Your journey starts with one tap.
            </p>
          )}
        </div>

        {/* Quick link to full path */}
        <Link
          href="/learn"
          className="block rounded-lg p-4 text-center text-sm font-medium"
          style={{ backgroundColor: '#122240', color: '#8BA3C4', border: '1px solid #374151' }}
        >
          View full learning path
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
