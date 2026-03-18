import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Bearer token auth
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const expectedToken = process.env.BRIEFING_API_TOKEN

  if (!expectedToken || !token || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const now = new Date()

  // Fetch learner profiles
  const { data: learners } = await adminClient
    .from('learner_profiles')
    .select('id, display_name, tier, last_active_at, streak_current, created_at')
    .order('created_at', { ascending: true })

  // Fetch all progress
  const { data: allProgress } = await adminClient
    .from('progress')
    .select('learner_id, module_id, status')

  // Count modules per tier
  const { data: modules } = await adminClient
    .from('modules')
    .select('id, tier')

  const TIER_ORDER = ['aware', 'enabled', 'specialist']
  const totalByTier = new Map<string, number>()
  for (const m of modules ?? []) {
    totalByTier.set(m.tier, (totalByTier.get(m.tier) ?? 0) + 1)
  }
  const totalForTier = (tier: string) => {
    const idx = TIER_ORDER.indexOf(tier)
    let total = 0
    for (let i = 0; i <= idx; i++) {
      total += totalByTier.get(TIER_ORDER[i]) ?? 0
    }
    return total
  }

  // Completed counts per learner
  const completedCounts = new Map<string, number>()
  for (const p of allProgress ?? []) {
    if (p.status === 'completed') {
      completedCounts.set(p.learner_id, (completedCounts.get(p.learner_id) ?? 0) + 1)
    }
  }

  // Fetch recent learning events (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentEvents } = await adminClient
    .from('learning_events')
    .select('learner_id, verb, object_type, object_id, created_at')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })

  // Fetch module titles for event display
  const moduleTitleMap = new Map<string, string>()
  for (const m of modules ?? []) {
    moduleTitleMap.set(m.id, '')
  }
  const { data: modulesWithTitle } = await adminClient
    .from('modules')
    .select('id, title')
  for (const m of modulesWithTitle ?? []) {
    moduleTitleMap.set(m.id, m.title)
  }

  // Build learner list
  const learnerList = (learners ?? []).map((l) => {
    const completed = completedCounts.get(l.id) ?? 0
    const total = totalForTier(l.tier ?? 'aware')
    const lastActive = l.last_active_at ? new Date(l.last_active_at) : null
    const daysInactive = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999

    let status: string
    if (daysInactive <= 3) status = 'active'
    else if (daysInactive <= 7) status = 'stalling'
    else if (daysInactive <= 14) status = 'inactive'
    else status = 'dormant'

    const events = (recentEvents ?? [])
      .filter((e) => e.learner_id === l.id)
      .slice(0, 5)
      .map((e) => ({
        verb: e.verb,
        object: moduleTitleMap.get(e.object_id) || e.object_type,
        date: e.created_at,
      }))

    return {
      name: l.display_name,
      tier: l.tier,
      modules_completed: completed,
      modules_total: total,
      completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      last_active: l.last_active_at,
      days_inactive: daysInactive,
      current_streak: l.streak_current ?? 0,
      status,
      recent_events: events,
    }
  })

  // Summary
  const totalLearners = learnerList.length
  const activeLast7 = learnerList.filter((l) => l.days_inactive <= 7).length
  const inactive7Plus = learnerList.filter((l) => l.days_inactive > 7).length
  const avgCompletion = totalLearners > 0
    ? Math.round(learnerList.reduce((s, l) => s + l.completion_pct, 0) / totalLearners)
    : 0

  return NextResponse.json({
    generated_at: now.toISOString(),
    summary: {
      total_learners: totalLearners,
      active_last_7_days: activeLast7,
      inactive_7_plus_days: inactive7Plus,
      average_completion_pct: avgCompletion,
    },
    learners: learnerList,
  })
}
