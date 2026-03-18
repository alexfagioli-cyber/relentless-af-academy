import { createClient } from '@/lib/supabase/server'
import { computeUnlockedModules } from '@/lib/prerequisites'
import { getDashboardMessage } from '@/lib/dashboard-messages'
import { BottomNav } from '@/components/layout/bottom-nav'
import Link from 'next/link'

const TIER_ORDER = ['aware', 'enabled', 'specialist'] as const

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
    .select('id, title, order_index, tier')
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
    (progress ?? []).filter((p) => p.status === 'completed').map((p) => p.module_id)
  )
  const completedCount = completedIds.size
  const totalCount = moduleIds.length

  // Find next available module
  const unlockedIds = computeUnlockedModules(moduleIds, prerequisites ?? [], completedIds)
  const nextModule = (modules ?? []).find(
    (m) => unlockedIds.has(m.id) && !completedIds.has(m.id)
  )

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>
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
              <>
                <p className="mt-2 text-base font-semibold" style={{ color: '#F9FAFB' }}>
                  {msg.headline}
                </p>
                <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
                  {msg.subtext}
                </p>
              </>
            )
          })()}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Tier</p>
            <p className="mt-1 text-lg font-semibold capitalize" style={{ color: '#F9FAFB' }}>
              {profile?.tier ?? '—'}
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Streak</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: '#F9FAFB' }}>
              {profile?.streak_current ?? 0} day{(profile?.streak_current ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Done</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: '#F9FAFB' }}>
              {completedCount}/{totalCount}
            </p>
          </div>
        </div>

        {/* Next module / Continue Learning */}
        {nextModule && completedCount === 0 ? (
          <Link
            href={`/learn/${nextModule.id}`}
            className="block rounded-lg p-5 mb-6 transition-all"
            style={{ backgroundColor: '#1E293B', border: '1px solid #DC2626' }}
          >
            <p className="text-sm mb-2" style={{ color: '#9CA3AF' }}>
              Welcome! Start your first module to begin your AI journey.
            </p>
            <p className="text-base font-semibold" style={{ color: '#F9FAFB' }}>
              {nextModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#DC2626' }}>
              Start →
            </p>
          </Link>
        ) : nextModule ? (
          <Link
            href={`/learn/${nextModule.id}`}
            className="block rounded-lg p-5 mb-6 transition-all"
            style={{ backgroundColor: '#1E293B', border: '1px solid #DC2626' }}
          >
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>
              Continue learning
            </p>
            <p className="text-base font-semibold" style={{ color: '#F9FAFB' }}>
              {nextModule.title}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#DC2626' }}>
              Start →
            </p>
          </Link>
        ) : completedCount === totalCount && totalCount > 0 ? (
          <div className="rounded-lg p-5 mb-6 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-base font-semibold" style={{ color: '#22C55E' }}>
              All modules completed
            </p>
            <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
              You&apos;ve finished everything available in your tier. Extraordinary.
            </p>
          </div>
        ) : (
          <div className="rounded-lg p-5 mb-6 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              Complete your current modules to unlock the next step.
            </p>
            <Link href="/learn" className="mt-2 inline-block text-sm font-semibold" style={{ color: '#DC2626' }}>
              View learning path →
            </Link>
          </div>
        )}

        {/* Quick link to full path */}
        <Link
          href="/learn"
          className="block rounded-lg p-4 text-center text-sm font-medium"
          style={{ backgroundColor: '#1E293B', color: '#9CA3AF', border: '1px solid #374151' }}
        >
          View full learning path
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
