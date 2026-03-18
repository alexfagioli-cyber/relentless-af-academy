import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { AdminDashboardClient } from './admin-client'
import { AdminNav } from './admin-nav'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check admin
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  // Use admin client (service_role) to read auth.users for emails
  const adminClient = createAdminClient()

  // Fetch all learner profiles
  const { data: learners } = await adminClient
    .from('learner_profiles')
    .select('id, display_name, tier, onboarding_complete, last_active_at, streak_current, streak_longest, is_admin, created_at, weekly_time_commitment, primary_goal, learning_motivation')
    .order('created_at', { ascending: true })

  // Fetch auth users for emails
  const { data: authData } = await adminClient.auth.admin.listUsers()
  const emailMap = new Map<string, string>()
  if (authData?.users) {
    for (const u of authData.users) {
      emailMap.set(u.id, u.email ?? '')
    }
  }

  // Fetch all progress
  const { data: allProgress } = await adminClient
    .from('progress')
    .select('learner_id, module_id, status')

  // Count completed modules per learner
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
  // Total visible to each tier
  const TIER_ORDER = ['aware', 'enabled', 'specialist']
  const totalForTier = (tier: string) => {
    const idx = TIER_ORDER.indexOf(tier)
    let total = 0
    for (let i = 0; i <= idx; i++) {
      total += totalByTier.get(TIER_ORDER[i]) ?? 0
    }
    return total
  }

  // Fetch all assessment attempts
  const { data: allAttempts } = await adminClient
    .from('assessment_attempts')
    .select('learner_id, assessment_id, score, passed, attempted_at')
    .order('attempted_at', { ascending: false })

  // Fetch all onboarding responses
  const { data: allOnboarding } = await adminClient
    .from('onboarding_responses')
    .select('learner_id, question_key, response')

  // Fetch invites
  const { data: invites } = await adminClient
    .from('invites')
    .select('id, email, status, expires_at, created_at')
    .order('created_at', { ascending: false })

  // Fetch assessment titles for display
  const { data: assessments } = await adminClient
    .from('assessments')
    .select('id, title')

  const assessmentTitleMap = new Map<string, string>()
  for (const a of assessments ?? []) {
    assessmentTitleMap.set(a.id, a.title)
  }

  // Fetch feedback
  const { data: allFeedback } = await adminClient
    .from('module_feedback')
    .select('learner_id, module_id, rating, comment, created_at')
    .order('created_at', { ascending: false })

  // Module title map for feedback display
  const moduleTitleMap = new Map<string, string>()
  for (const m of modules ?? []) {
    moduleTitleMap.set(m.id, '')
  }
  const { data: modulesWithTitles } = await adminClient
    .from('modules')
    .select('id, title')
  for (const m of modulesWithTitles ?? []) {
    moduleTitleMap.set(m.id, m.title)
  }

  // Fetch general feedback (floating button)
  const { data: allGeneralFeedback } = await adminClient
    .from('general_feedback')
    .select('learner_id, page, rating, comment, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  const generalFeedbackData = (allGeneralFeedback ?? []).map((f) => {
    const learner = (learners ?? []).find((l) => l.id === f.learner_id)
    return {
      learnerName: learner?.display_name ?? 'Unknown',
      page: f.page,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.created_at,
    }
  })

  // Build feedback data for client
  const feedbackData = (allFeedback ?? []).slice(0, 20).map((f) => {
    const learner = (learners ?? []).find((l) => l.id === f.learner_id)
    return {
      learnerName: learner?.display_name ?? 'Unknown',
      moduleTitle: moduleTitleMap.get(f.module_id) ?? 'Unknown',
      rating: f.rating,
      comment: f.comment,
      createdAt: f.created_at,
    }
  })

  // Build learner data for client
  const now = new Date()
  const learnerData = (learners ?? []).map((l) => {
    const email = emailMap.get(l.id) ?? ''
    const completed = completedCounts.get(l.id) ?? 0
    const total = totalForTier(l.tier ?? 'aware')
    const lastActive = l.last_active_at ? new Date(l.last_active_at) : null
    const daysInactive = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999

    const attempts = (allAttempts ?? [])
      .filter((a) => a.learner_id === l.id)
      .map((a) => ({
        assessment_title: assessmentTitleMap.get(a.assessment_id) ?? 'Unknown',
        score: a.score,
        passed: a.passed,
        attempted_at: a.attempted_at,
      }))

    const onboarding = (allOnboarding ?? [])
      .filter((o) => o.learner_id === l.id)
      .map((o) => ({
        question_key: o.question_key,
        response: o.response,
      }))

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
      weeklyTime: l.weekly_time_commitment,
      primaryGoal: l.primary_goal,
      motivation: l.learning_motivation,
      attempts,
      onboarding,
    }
  })

  // Summary stats
  const totalLearners = learnerData.length
  const avgCompletion = totalLearners > 0 ? Math.round(learnerData.reduce((s, l) => s + l.completionPct, 0) / totalLearners) : 0
  const avgStreak = totalLearners > 0 ? Math.round(learnerData.reduce((s, l) => s + l.streakCurrent, 0) / totalLearners * 10) / 10 : 0
  const tierCounts = { aware: 0, enabled: 0, specialist: 0 }
  for (const l of learnerData) {
    if (l.tier && l.tier in tierCounts) {
      tierCounts[l.tier as keyof typeof tierCounts]++
    }
  }
  const mostCommonTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'aware'

  const inviteData = (invites ?? []).map((inv) => ({
    id: inv.id,
    email: inv.email,
    status: new Date(inv.expires_at) < now && inv.status === 'pending' ? 'expired' : inv.status,
    expiresAt: inv.expires_at,
    createdAt: inv.created_at,
  }))

  return (
    <>
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#E8F0FE' }}>Admin</h1>
      <AdminNav />
      <AdminDashboardClient
        learners={learnerData}
        invites={inviteData}
        feedback={feedbackData}
        generalFeedback={generalFeedbackData}
        summary={{
          totalLearners,
          avgCompletion,
          avgStreak,
          mostCommonTier,
          tierCounts,
        }}
      />
    </>
  )
}
