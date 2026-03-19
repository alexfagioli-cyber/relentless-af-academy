import { createClient } from '@/lib/supabase/server'
import { computeUnlockedModules } from '@/lib/prerequisites'
import { getDashboardMessage } from '@/lib/dashboard-messages'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ProgressRing } from '@/components/ui/progress-ring'
import { getDailyTip } from '@/lib/daily-tips'
import { getDueReviewCount } from '@/lib/spaced-repetition'
import Link from 'next/link'

const TIER_ORDER = ['aware', 'enabled', 'specialist'] as const
const TIER_COLOURS: Record<string, string> = {
  aware: '#E8C872',
  enabled: '#E8C872',
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

  // FIX #1: Get ALL modules from aware upward — an Enabled learner still starts at A00
  const { data: allModules } = await supabase
    .from('modules')
    .select('id, title, order_index, tier, module_type, estimated_duration_mins')
    .in('tier', visibleTiers)
    .order('order_index', { ascending: true })

  const modules = allModules ?? []
  const moduleIds = modules.map((m) => m.id)

  const { data: prerequisites } = await supabase
    .from('prerequisites')
    .select('module_id, prerequisite_module_id, prerequisite_group')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['00000000-0000-0000-0000-000000000000'])

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

  // Next module: across ALL visible tiers, sorted by order_index (lowest first = A00)
  const unlockedIds = computeUnlockedModules(moduleIds, prerequisites ?? [], completedIds)
  const inProgressModule = modules.find((m) => inProgressIds.has(m.id))
  const nextModule = modules.find(
    (m) => unlockedIds.has(m.id) && !completedIds.has(m.id),
  )
  const resumeModule = inProgressModule ?? nextModule

  // Tier progress for assigned tier
  const currentTierModules = modules.filter((m) => m.tier === learnerTier)
  const currentTierCompleted = currentTierModules.filter((m) => completedIds.has(m.id)).length
  const currentTierTotal = currentTierModules.length
  const nextInTier = currentTierModules.find(
    (m) => unlockedIds.has(m.id) && !completedIds.has(m.id),
  )

  // Total time invested
  const totalMins = modules
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

  const moduleMap = new Map(modules.map((m) => [m.id, m]))
  const dueReviews = await getDueReviewCount(supabase, user?.id ?? '')

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in">
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
            Welcome back{profile?.display_name ? `, ${getFirstName(profile.display_name)}` : ''}
          </h1>
          {(() => {
            const msg = getDashboardMessage({
              tier: profile?.tier ?? 'aware',
              occupation: profile?.occupation ?? null,
              learning_motivation: profile?.learning_motivation ?? null,
              primary_goal: profile?.primary_goal ?? null,
            })
            return (
              <p className="mt-1 text-sm" style={{ color: '#D4D4E8' }}>
                {msg.subtext}
              </p>
            )
          })()}
        </div>

        {/* Futures card */}
        <Link
          href="/futures"
          className="block rounded-xl p-5 mb-6 transition-all card-depth gold-glow"
          style={{ border: '2px solid #E8C872' }}
        >
          <p className="text-base font-bold" style={{ color: '#E8C872' }}>
            Where could AI take you?
          </p>
          <p className="text-sm mt-1" style={{ color: '#D4D4E8' }}>
            Real stories, an interactive explorer, and 15 things you can do with AI today.
          </p>
          <p className="mt-3 text-sm font-semibold" style={{ color: '#E8C872' }}>
            Explore →
          </p>
        </Link>

        <div className="section-divider" />

        {/* Quick stats bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 rounded-lg px-3 py-2 text-center card-depth">
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Time</p>
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {totalHours > 0 ? `${totalHours}h${remainderMins > 0 ? ` ${remainderMins}m` : ''}` : `${totalMins}m`}
            </p>
          </div>
          <div className="flex-1 rounded-lg px-3 py-2 text-center card-depth">
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Streak</p>
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {(profile?.streak_current ?? 0) > 0 ? `🔥 ${profile?.streak_current}d` : '0d'}
            </p>
          </div>
          <div className="flex-1 rounded-lg px-3 py-2 text-center card-depth" style={{ borderBottom: `2px solid ${TIER_COLOURS[learnerTier] ?? '#E8C872'}` }}>
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Tier</p>
            <p className="text-sm font-semibold capitalize" style={{ color: TIER_COLOURS[learnerTier] ?? '#E8F0FE' }}>
              {learnerTier}
            </p>
          </div>
        </div>

        {/* Progress ring + tier progress */}
        <div className="flex items-center gap-4 mb-6 rounded-lg px-3 py-3 card-depth">
          <ProgressRing completed={currentTierCompleted} total={currentTierTotal} size={56} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {currentTierCompleted} of {currentTierTotal} in {learnerTier.charAt(0).toUpperCase() + learnerTier.slice(1)}
            </p>
            {nextInTier && (
              <p className="mt-0.5 text-xs truncate" style={{ color: '#D4D4E8' }}>
                Next: {nextInTier.title}
              </p>
            )}
            {currentTierCompleted === currentTierTotal && currentTierTotal > 0 && (
              <p className="mt-0.5 text-xs font-semibold" style={{ color: '#22C55E' }}>
                Tier complete
              </p>
            )}
          </div>
        </div>

        <div className="section-divider" />

        {/* Continue / Resume card */}
        {resumeModule && completedCount === 0 ? (
          <Link
            href={`/learn/${resumeModule.id}`}
            className="block rounded-lg p-5 mb-4 transition-all card-depth gold-glow"
            style={{ border: '1px solid #E8C872' }}
          >
            <p className="text-sm mb-2" style={{ color: '#D4D4E8' }}>
              Nothing started yet. That changes today.
            </p>
            <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              {MODULE_TYPE_ICONS[resumeModule.module_type] ?? ''} {resumeModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#E8C872' }}>
              Start →
            </p>
          </Link>
        ) : resumeModule ? (
          <Link
            href={`/learn/${resumeModule.id}`}
            className="block rounded-lg p-5 mb-4 transition-all card-depth gold-glow"
            style={{ border: '1px solid #E8C872' }}
          >
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#D4D4E8' }}>
              {inProgressModule ? 'Continue where you left off' : 'Up next'}
            </p>
            <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              {MODULE_TYPE_ICONS[resumeModule.module_type] ?? ''} {resumeModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#E8C872' }}>
              {inProgressModule ? 'Resume →' : 'Start →'}
            </p>
          </Link>
        ) : completedCount === totalCount && totalCount > 0 ? (
          <div className="rounded-lg p-5 mb-4 text-center card-depth">
            <p className="text-base font-semibold" style={{ color: '#22C55E' }}>
              All modules completed
            </p>
            <p className="mt-1 text-sm" style={{ color: '#D4D4E8' }}>
              You&apos;ve finished everything available in your tier. Extraordinary.
            </p>
          </div>
        ) : (
          <div className="rounded-lg p-5 mb-4 text-center card-depth">
            <p className="text-sm" style={{ color: '#D4D4E8' }}>
              Complete your current modules to unlock the next step.
            </p>
          </div>
        )}

        {/* Reviews due */}
        {dueReviews > 0 && (
          <Link
            href="/review"
            className="block rounded-lg p-4 mb-4 transition-all card-depth"
            style={{ border: '1px solid #E8C872' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Reviews due</p>
                <p className="text-xs mt-0.5" style={{ color: '#D4D4E8' }}>
                  {dueReviews} module{dueReviews !== 1 ? 's' : ''} ready for review
                </p>
              </div>
              <span className="rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}>
                {dueReviews}
              </span>
            </div>
          </Link>
        )}

        {/* Daily tip */}
        <div className="rounded-lg p-4 mb-4 card-depth" style={{ borderLeft: '3px solid #E8C872' }}>
          <p className="text-sm" style={{ color: '#D4D4E8' }}>
            {getDailyTip()}
          </p>
        </div>

        <div className="section-divider" />

        {/* Quick access cards — 2x3 grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/community" className="rounded-lg p-4 transition-all card-depth" style={{ border: '1px solid #E8C872' }}>
            <p className="text-sm font-semibold" style={{ color: '#E8C872' }}>Community</p>
            <p className="text-xs mt-1" style={{ color: '#D4D4E8' }}>Share and learn together</p>
          </Link>
          <Link href="/tools" className="rounded-lg p-4 transition-all card-depth" style={{ border: '1px solid #E8C872' }}>
            <p className="text-sm font-semibold" style={{ color: '#E8C872' }}>AI Tools</p>
            <p className="text-xs mt-1" style={{ color: '#D4D4E8' }}>Curated directory</p>
          </Link>
          <Link href="/news" className="rounded-lg p-4 transition-all card-depth" style={{ border: '1px solid #E8C872' }}>
            <p className="text-sm font-semibold" style={{ color: '#E8C872' }}>Latest News</p>
            <p className="text-xs mt-1" style={{ color: '#D4D4E8' }}>AI updates and ideas</p>
          </Link>
          <Link href="/prompts" className="rounded-lg p-4 transition-all card-depth" style={{ border: '1px solid #E8C872' }}>
            <p className="text-sm font-semibold" style={{ color: '#E8C872' }}>Prompt Library</p>
            <p className="text-xs mt-1" style={{ color: '#D4D4E8' }}>Templates that work</p>
          </Link>
          <div className="rounded-lg p-4 card-depth" style={{ border: '1px solid #363654', opacity: 0.6 }}>
            <p className="text-sm font-semibold" style={{ color: '#E8C872' }}>AI Playground</p>
            <p className="text-xs mt-1" style={{ color: '#8BA3C4' }}>Coming soon</p>
          </div>
          <Link href="/learn/026f2263-67f7-5e35-a104-3f8315397376" className="rounded-lg p-4 transition-all card-depth" style={{ border: '1px solid #8B5CF6', background: 'linear-gradient(135deg, #1A1A2E 0%, #25253D 100%)' }}>
            <p className="text-xs" style={{ color: '#8B5CF6' }}>⚡ Specialist Preview</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#FFFFFF' }}>Building Skills</p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Free taster — try it now</p>
          </Link>
        </div>

        <div className="section-divider" />

        {/* Recent activity */}
        <div className="rounded-lg p-4 mb-4 card-depth">
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

        {/* Full learning path link */}
        <Link
          href="/learn"
          className="block rounded-lg p-4 text-center text-sm font-medium mb-4"
          style={{ backgroundColor: '#25253D', color: '#D4D4E8', border: '1px solid #374151' }}
        >
          View full learning path
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}

function getFirstName(name: string): string {
  if (name.includes(' ')) return name.split(' ')[0]
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
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
