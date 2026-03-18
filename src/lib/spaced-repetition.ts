import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Schedule spaced repetition reviews after module completion.
 * Creates 3 review entries: +7 days, +30 days, +90 days.
 */
export async function scheduleReviews(supabase: SupabaseClient, learnerId: string, moduleId: string) {
  const today = new Date()
  const intervals = [
    { type: '1_week', days: 7 },
    { type: '1_month', days: 30 },
    { type: '3_month', days: 90 },
  ] as const

  const rows = intervals.map(({ type, days }) => {
    const due = new Date(today)
    due.setDate(due.getDate() + days)
    return {
      learner_id: learnerId,
      module_id: moduleId,
      review_type: type,
      due_date: due.toISOString().split('T')[0],
    }
  })

  await supabase.from('review_schedule').upsert(rows, {
    onConflict: 'learner_id,module_id',
    ignoreDuplicates: true,
  })
}

/**
 * Get count of reviews due today or earlier.
 */
export async function getDueReviewCount(supabase: SupabaseClient, learnerId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('review_schedule')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('completed', false)
    .lte('due_date', today)
  return count ?? 0
}
