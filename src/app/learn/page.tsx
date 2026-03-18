import { createClient } from '@/lib/supabase/server'
import { computeUnlockedModules } from '@/lib/prerequisites'
import { BottomNav } from '@/components/layout/bottom-nav'
import Link from 'next/link'

const TIER_ORDER = ['aware', 'enabled', 'specialist'] as const
const TIER_LABELS: Record<string, string> = {
  aware: 'Aware',
  enabled: 'Enabled',
  specialist: 'Specialist',
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

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get learner profile for tier
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('tier')
    .eq('id', user?.id ?? '')
    .single()

  const learnerTier = profile?.tier ?? 'aware'
  const tierIndex = TIER_ORDER.indexOf(learnerTier as typeof TIER_ORDER[number])
  const visibleTiers = TIER_ORDER.slice(0, tierIndex + 1)

  // Get modules for visible tiers
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .in('tier', visibleTiers)
    .order('order_index', { ascending: true })

  // Get all prerequisites for visible modules
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: prerequisites } = await supabase
    .from('prerequisites')
    .select('module_id, prerequisite_module_id, prerequisite_group')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['00000000-0000-0000-0000-000000000000'])

  // Get learner progress
  const { data: progress } = await supabase
    .from('progress')
    .select('module_id, status')
    .eq('learner_id', user?.id ?? '')

  const progressMap = new Map((progress ?? []).map((p) => [p.module_id, p.status]))
  const completedIds = new Set(
    (progress ?? []).filter((p) => p.status === 'completed').map((p) => p.module_id)
  )

  const unlockedIds = computeUnlockedModules(moduleIds, prerequisites ?? [], completedIds)

  type ModuleStatus = 'completed' | 'in_progress' | 'available' | 'locked'

  function getStatus(moduleId: string): ModuleStatus {
    const progressStatus = progressMap.get(moduleId)
    if (progressStatus === 'completed') return 'completed'
    if (progressStatus === 'in_progress') return 'in_progress'
    if (unlockedIds.has(moduleId)) return 'available'
    return 'locked'
  }

  // Group modules by tier
  const groupedModules = visibleTiers.map((tier) => ({
    tier,
    modules: (modules ?? []).filter((m) => m.tier === tier),
  }))

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#F9FAFB' }}>
          Learning Path
        </h1>

        {groupedModules.map(({ tier, modules: tierModules }) => (
          <div key={tier} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
              {TIER_LABELS[tier]} Tier
            </h2>
            <div className="space-y-3">
              {tierModules.map((mod) => {
                const status = getStatus(mod.id)
                const isLocked = status === 'locked'

                const borderColor =
                  status === 'completed' ? '#22C55E' :
                  status === 'available' ? '#DC2626' :
                  status === 'in_progress' ? '#F59E0B' :
                  '#374151'

                const content = (
                  <div
                    className="rounded-lg p-4 transition-status"
                    style={{
                      backgroundColor: '#1E293B',
                      border: `1px solid ${borderColor}`,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="mt-0.5 text-lg flex-shrink-0">
                        {status === 'completed' && <span style={{ color: '#22C55E' }}>✓</span>}
                        {status === 'in_progress' && <span>▶</span>}
                        {status === 'available' && <span>{TYPE_ICONS[mod.module_type] ?? '📖'}</span>}
                        {status === 'locked' && <span style={{ color: '#6B7280' }}>🔒</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>
                          {mod.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>
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

                if (isLocked) {
                  return <div key={mod.id}>{content}</div>
                }

                return (
                  <Link key={mod.id} href={`/learn/${mod.id}`}>
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
