import type { SupabaseClient } from '@supabase/supabase-js'

export interface BadgeDef {
  key: string
  name: string
  description: string
  emoji: string
  colour: string
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  { key: 'first_login', name: 'First Steps', description: 'Completed onboarding', emoji: '🚀', colour: '#8BA3C4' },
  { key: 'first_module', name: 'Off the Mark', description: 'Completed first module', emoji: '✅', colour: '#E8C872' },
  { key: 'first_assessment', name: 'Tested', description: 'Passed first assessment', emoji: '📝', colour: '#E8C872' },
  { key: 'streak_3', name: 'Consistency', description: '3-day streak', emoji: '🔥', colour: '#8BA3C4' },
  { key: 'streak_7', name: 'Relentless Week', description: '7-day streak', emoji: '⚡', colour: '#E8C872' },
  { key: 'streak_30', name: 'Unstoppable', description: '30-day streak', emoji: '💎', colour: '#E8C872' },
  { key: 'tier_aware', name: 'AI Aware', description: 'Completed Aware tier gate', emoji: '🥉', colour: '#CD7F32' },
  { key: 'tier_enabled', name: 'AI Enabled', description: 'Completed Enabled tier gate', emoji: '🥈', colour: '#8BA3C4' },
  { key: 'tier_specialist', name: 'Specialist', description: 'Completed Specialist tier gate', emoji: '🥇', colour: '#E8C872' },
  { key: 'all_challenges', name: 'Challenger', description: 'Completed all challenges in your tier', emoji: '⚔️', colour: '#E8C872' },
  { key: 'cert_verified', name: 'Certified', description: 'Verified a Skilljar certificate', emoji: '🎓', colour: '#E8C872' },
  { key: 'feedback_given', name: 'Voice Heard', description: 'Gave your first feedback', emoji: '💬', colour: '#8BA3C4' },
]

export async function checkAndAwardBadges(supabase: SupabaseClient, learnerId: string) {
  // Get existing badges
  const { data: existing } = await supabase
    .from('badges')
    .select('badge_key')
    .eq('learner_id', learnerId)
  const earned = new Set((existing ?? []).map((b) => b.badge_key))

  const toAward: string[] = []

  // Get profile
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('onboarding_complete, tier, streak_current')
    .eq('id', learnerId)
    .single()

  // first_login
  if (!earned.has('first_login') && profile?.onboarding_complete) {
    toAward.push('first_login')
  }

  // Get learning events counts
  const { count: completedCount } = await supabase
    .from('learning_events')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('verb', 'completed')

  const { count: passedCount } = await supabase
    .from('learning_events')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('verb', 'passed')

  // first_module
  if (!earned.has('first_module') && (completedCount ?? 0) >= 1) {
    toAward.push('first_module')
  }

  // first_assessment
  if (!earned.has('first_assessment') && (passedCount ?? 0) >= 1) {
    toAward.push('first_assessment')
  }

  // streaks
  const streak = profile?.streak_current ?? 0
  if (!earned.has('streak_3') && streak >= 3) toAward.push('streak_3')
  if (!earned.has('streak_7') && streak >= 7) toAward.push('streak_7')
  if (!earned.has('streak_30') && streak >= 30) toAward.push('streak_30')

  // tier gates — check if tier gate assessments are passed
  const { data: progress } = await supabase
    .from('progress')
    .select('module_id, status')
    .eq('learner_id', learnerId)
    .eq('status', 'completed')

  const completedIds = new Set((progress ?? []).map((p) => p.module_id))

  // Get tier gate modules
  const { data: modules } = await supabase
    .from('modules')
    .select('id, tier, module_type, title')

  const tierGates = (modules ?? []).filter((m) => m.title?.includes('Tier Gate'))
  for (const gate of tierGates) {
    if (completedIds.has(gate.id)) {
      if (gate.tier === 'aware' && !earned.has('tier_aware')) toAward.push('tier_aware')
      if (gate.tier === 'enabled' && !earned.has('tier_enabled')) toAward.push('tier_enabled')
      if (gate.tier === 'specialist' && !earned.has('tier_specialist')) toAward.push('tier_specialist')
    }
  }

  // all_challenges — check if all challenge modules in learner's tier are completed
  if (!earned.has('all_challenges') && profile?.tier) {
    const tierChallenges = (modules ?? []).filter(
      (m) => m.tier === profile.tier && m.module_type === 'challenge',
    )
    if (tierChallenges.length > 0 && tierChallenges.every((m) => completedIds.has(m.id))) {
      toAward.push('all_challenges')
    }
  }

  // cert_verified — check learning events with certificate context
  if (!earned.has('cert_verified')) {
    const { count: certCount } = await supabase
      .from('learning_events')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', learnerId)
      .eq('verb', 'completed')
      .contains('context', { verification_method: 'certificate' })
    if ((certCount ?? 0) >= 1) toAward.push('cert_verified')
  }

  // feedback_given
  if (!earned.has('feedback_given')) {
    const { count: fbCount } = await supabase
      .from('general_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', learnerId)
    const { count: mfCount } = await supabase
      .from('module_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', learnerId)
    if (((fbCount ?? 0) + (mfCount ?? 0)) >= 1) toAward.push('feedback_given')
  }

  // Award new badges
  if (toAward.length > 0) {
    await supabase
      .from('badges')
      .upsert(
        toAward.map((key) => ({ learner_id: learnerId, badge_key: key })),
        { onConflict: 'learner_id,badge_key' },
      )
  }

  return toAward
}
