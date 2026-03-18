import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import { ReviewClient } from './review-client'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  // Get due reviews
  const { data: reviews } = await supabase
    .from('review_schedule')
    .select('id, module_id, review_type, due_date')
    .eq('learner_id', user.id)
    .eq('completed', false)
    .lte('due_date', today)
    .order('due_date', { ascending: true })

  // Get module titles
  const moduleIds = [...new Set((reviews ?? []).map((r) => r.module_id))]
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, module_type')
    .in('id', moduleIds.length > 0 ? moduleIds : ['00000000-0000-0000-0000-000000000000'])

  const moduleMap = new Map((modules ?? []).map((m) => [m.id, m]))

  const reviewData = (reviews ?? []).map((r) => ({
    id: r.id,
    moduleId: r.module_id,
    moduleTitle: moduleMap.get(r.module_id)?.title ?? 'Unknown',
    moduleType: moduleMap.get(r.module_id)?.module_type ?? 'course',
    reviewType: r.review_type,
    dueDate: r.due_date,
  }))

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>Reviews Due</h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          Spaced repetition — revisit what you&apos;ve learned to make it stick.
        </p>

        <ReviewClient reviews={reviewData} userId={user.id} />
      </div>
      <BottomNav />
    </div>
  )
}
