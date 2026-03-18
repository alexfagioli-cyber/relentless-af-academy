import { createAdminClient } from '@/lib/supabase/admin'
import { AdminNav } from '../admin-nav'
import { LearnersClient } from './learners-client'

export default async function AdminLearnersPage() {
  const adminClient = createAdminClient()

  // Fetch all learner profiles
  const { data: learners, error: learnersError } = await adminClient
    .from('learner_profiles')
    .select('id, display_name, tier, last_active_at, streak_current, streak_longest, is_admin, created_at, learning_motivation')
    .order('created_at', { ascending: true })

  if (learnersError) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#1E293B' }}>Admin</h1>
        <p className="text-sm mb-4" style={{ color: '#64748B' }}>Learners</p>
        <AdminNav />
        <p style={{ color: '#D4A31E' }}>Failed to load learners: {learnersError.message}</p>
      </>
    )
  }

  // Fetch auth users for emails
  const { data: authData } = await adminClient.auth.admin.listUsers()
  const emailMap = new Map<string, string>()
  if (authData?.users) {
    for (const u of authData.users) {
      emailMap.set(u.id, u.email ?? '')
    }
  }

  // Fetch all progress records
  const { data: allProgress } = await adminClient
    .from('progress')
    .select('learner_id, status')

  // Count completed per learner
  const completedCounts = new Map<string, number>()
  for (const p of allProgress ?? []) {
    if (p.status === 'completed') {
      completedCounts.set(p.learner_id, (completedCounts.get(p.learner_id) ?? 0) + 1)
    }
  }

  // Count total modules per tier (for completion %)
  const { data: modules } = await adminClient
    .from('modules')
    .select('id, tier')

  const totalByTier = new Map<string, number>()
  for (const m of modules ?? []) {
    totalByTier.set(m.tier, (totalByTier.get(m.tier) ?? 0) + 1)
  }

  const TIER_ORDER = ['aware', 'enabled', 'specialist']
  const totalForTier = (tier: string) => {
    const idx = TIER_ORDER.indexOf(tier)
    let total = 0
    for (let i = 0; i <= idx; i++) {
      total += totalByTier.get(TIER_ORDER[i]) ?? 0
    }
    return total
  }

  // Build learner data for client
  const now = new Date()
  const learnerData = (learners ?? []).map((l) => {
    const email = emailMap.get(l.id) ?? ''
    const completed = completedCounts.get(l.id) ?? 0
    const total = totalForTier(l.tier ?? 'aware')
    const lastActive = l.last_active_at ? new Date(l.last_active_at) : null
    const daysInactive = lastActive
      ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      : 999

    return {
      id: l.id,
      displayName: l.display_name,
      email,
      tier: l.tier,
      completed,
      total,
      completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      lastActive: l.last_active_at,
      daysInactive,
      streakCurrent: l.streak_current ?? 0,
      streakLongest: l.streak_longest ?? 0,
      isAdmin: l.is_admin,
      motivation: l.learning_motivation,
    }
  })

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1E293B' }}>Admin</h1>
      <p className="text-sm mb-4" style={{ color: '#64748B' }}>Learners</p>
      <AdminNav />
      <LearnersClient learners={learnerData} />
    </>
  )
}
