import { createAdminClient } from '@/lib/supabase/admin'
import { AdminNav } from '../admin-nav'
import { AnalyticsClient } from './analytics-client'

export default async function AdminAnalyticsPage() {
  const adminClient = createAdminClient()

  // Time boundaries
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch learning events (last 30 days) for engagement chart + recent feed
  const { data: learningEvents } = await adminClient
    .from('learning_events')
    .select('learner_id, verb, object_type, object_id, created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })

  // Fetch all progress for completion funnel
  const { data: allProgress } = await adminClient
    .from('progress')
    .select('learner_id, module_id, status')

  // Fetch learner profiles for tier distribution + names + active-this-week
  const { data: learners } = await adminClient
    .from('learner_profiles')
    .select('id, display_name, tier, last_active_at, streak_current')

  // Fetch assessment attempts + assessments for pass rates
  const { data: assessmentAttempts } = await adminClient
    .from('assessment_attempts')
    .select('learner_id, assessment_id, score, passed, attempted_at')

  const { data: assessments } = await adminClient
    .from('assessments')
    .select('id, title')

  // Fetch modules for titles and durations
  const { data: modules } = await adminClient
    .from('modules')
    .select('id, title, estimated_duration_mins')

  // --- Compute stats server-side ---

  const learnerList = learners ?? []
  const events = learningEvents ?? []
  const progressList = allProgress ?? []
  const attemptList = assessmentAttempts ?? []
  const assessmentList = assessments ?? []
  const moduleList = modules ?? []

  // Module title map
  const moduleTitleMap: Record<string, string> = {}
  for (const m of moduleList) {
    moduleTitleMap[m.id] = m.title
  }

  // Assessment title map
  const assessmentTitleMap: Record<string, string> = {}
  for (const a of assessmentList) {
    assessmentTitleMap[a.id] = a.title
  }

  // Learner name map
  const learnerNameMap: Record<string, string> = {}
  for (const l of learnerList) {
    learnerNameMap[l.id] = l.display_name ?? 'Unknown'
  }

  // 1. Top stats
  const totalLearners = learnerList.length
  const activeThisWeek = learnerList.filter(
    (l) => l.last_active_at && new Date(l.last_active_at) >= new Date(sevenDaysAgo)
  ).length

  const totalModules = moduleList.length
  const completedProgressEntries = progressList.filter((p) => p.status === 'completed')
  const avgCompletionPct =
    totalLearners > 0 && totalModules > 0
      ? Math.round(
          (completedProgressEntries.length / (totalLearners * totalModules)) * 100
        )
      : 0

  const avgStreak =
    totalLearners > 0
      ? Math.round(
          (learnerList.reduce((sum, l) => sum + (l.streak_current ?? 0), 0) /
            totalLearners) *
            10
        ) / 10
      : 0

  // Total learning hours: sum of estimated_duration_mins for all completed progress entries
  const durationMap: Record<string, number> = {}
  for (const m of moduleList) {
    durationMap[m.id] = m.estimated_duration_mins ?? 0
  }
  let totalMins = 0
  for (const p of completedProgressEntries) {
    totalMins += durationMap[p.module_id] ?? 0
  }
  const totalLearningHours = Math.round((totalMins / 60) * 10) / 10

  // 2. Engagement over time: daily active users (last 30 days)
  const dailyActiveMap: Record<string, Set<string>> = {}
  for (const e of events) {
    const day = e.created_at.slice(0, 10) // YYYY-MM-DD
    if (!dailyActiveMap[day]) dailyActiveMap[day] = new Set()
    dailyActiveMap[day].add(e.learner_id)
  }
  // Build array for all 30 days
  const engagementData: { date: string; activeUsers: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    engagementData.push({
      date: key,
      activeUsers: dailyActiveMap[key]?.size ?? 0,
    })
  }

  // 3. Module completion funnel: per module, count completed
  const moduleCompletionMap: Record<string, number> = {}
  for (const p of completedProgressEntries) {
    moduleCompletionMap[p.module_id] = (moduleCompletionMap[p.module_id] ?? 0) + 1
  }
  const completionFunnelData = moduleList.map((m) => ({
    module: m.title.length > 25 ? m.title.slice(0, 22) + '...' : m.title,
    fullTitle: m.title,
    completed: moduleCompletionMap[m.id] ?? 0,
  }))

  // 4. Tier distribution
  const tierCounts: Record<string, number> = { aware: 0, enabled: 0, specialist: 0 }
  for (const l of learnerList) {
    const tier = l.tier ?? 'aware'
    tierCounts[tier] = (tierCounts[tier] ?? 0) + 1
  }
  const tierData = Object.entries(tierCounts)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value: count,
    }))

  // 5. Assessment pass rates
  const assessmentStatsMap: Record<string, { total: number; passed: number }> = {}
  for (const a of attemptList) {
    if (!assessmentStatsMap[a.assessment_id]) {
      assessmentStatsMap[a.assessment_id] = { total: 0, passed: 0 }
    }
    assessmentStatsMap[a.assessment_id].total++
    if (a.passed) assessmentStatsMap[a.assessment_id].passed++
  }
  const passRateData = Object.entries(assessmentStatsMap).map(([id, stats]) => ({
    assessment:
      (assessmentTitleMap[id] ?? 'Unknown').length > 25
        ? (assessmentTitleMap[id] ?? 'Unknown').slice(0, 22) + '...'
        : assessmentTitleMap[id] ?? 'Unknown',
    fullTitle: assessmentTitleMap[id] ?? 'Unknown',
    passRate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
    total: stats.total,
    passed: stats.passed,
  }))

  // 6. Recent activity feed (last 20 events)
  const recentActivity = events.slice(0, 20).map((e) => ({
    learnerName: learnerNameMap[e.learner_id] ?? 'Unknown',
    verb: e.verb,
    objectType: e.object_type,
    objectId: e.object_id,
    objectTitle: moduleTitleMap[e.object_id] ?? e.object_id,
    createdAt: e.created_at,
  }))

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>Admin</h1>
      <p className="text-sm mb-4" style={{ color: '#D4D4E8' }}>Analytics</p>
      <AdminNav />
      <AnalyticsClient
        stats={{
          totalLearners,
          activeThisWeek,
          avgCompletionPct,
          avgStreak,
          totalLearningHours,
        }}
        engagementData={engagementData}
        completionFunnelData={completionFunnelData}
        tierData={tierData}
        passRateData={passRateData}
        recentActivity={recentActivity}
      />
    </>
  )
}
