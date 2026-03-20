import { createClient } from '@/lib/supabase/server'
import { computeUnlockedModules } from '@/lib/prerequisites'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ModuleList } from './module-list'

const TIER_ORDER = ['aware', 'enabled', 'specialist'] as const
const TIER_LABELS: Record<string, string> = {
  aware: 'Aware',
  enabled: 'Enabled',
  specialist: 'Specialist',
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

  // Show all tiers — locked modules are still gated by prerequisites
  const visibleTiers = [...TIER_ORDER]

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

  // Status priority for smart ordering: active first, completed last
  const STATUS_PRIORITY: Record<string, number> = {
    in_progress: 0,
    available: 1,
    not_started: 2,
    completed: 3,
    locked: 4,
  }

  // Group modules by tier with statuses, sorted: active first, completed last
  const tierGroups = visibleTiers.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    modules: (modules ?? [])
      .filter((m) => m.tier === tier)
      .map((mod) => ({
        id: mod.id,
        title: mod.title,
        module_type: mod.module_type,
        estimated_duration_mins: mod.estimated_duration_mins,
        platform: mod.platform,
        status: getStatus(mod.id),
        order_index: mod.order_index as number,
      }))
      .sort((a, b) => {
        const statusDiff = (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9)
        if (statusDiff !== 0) return statusDiff
        return a.order_index - b.order_index
      }),
  }))

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
          Learning Path
        </h1>

        <ModuleList groups={tierGroups} />
      </div>

      <BottomNav />
    </div>
  )
}
