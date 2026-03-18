import type { SupabaseClient } from '@supabase/supabase-js'

export async function updateStreak(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('streak_current, streak_longest, streak_last_date')
    .eq('id', userId)
    .single()

  if (!profile) return

  const lastDate = profile.streak_last_date // YYYY-MM-DD or null
  let newCurrent = profile.streak_current ?? 0
  let newLongest = profile.streak_longest ?? 0

  if (lastDate === today) {
    // Already active today — no change
    return
  }

  // Check if last date was yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastDate === yesterdayStr) {
    // Consecutive day — increment
    newCurrent += 1
  } else {
    // Gap or first activity — reset to 1
    newCurrent = 1
  }

  if (newCurrent > newLongest) {
    newLongest = newCurrent
  }

  await supabase
    .from('learner_profiles')
    .update({
      streak_current: newCurrent,
      streak_longest: newLongest,
      streak_last_date: today,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', userId)
}
