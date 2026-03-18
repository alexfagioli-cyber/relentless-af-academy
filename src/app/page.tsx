import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('display_name, tier, streak_current')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
            Keep pushing. Every session compounds.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Tier</p>
            <p className="mt-1 text-lg font-semibold capitalize" style={{ color: '#F9FAFB' }}>
              {profile?.tier ?? '—'}
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Streak</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: '#F9FAFB' }}>
              {profile?.streak_current ?? 0} days
            </p>
          </div>
        </div>

        {/* Learning path placeholder */}
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1E293B' }}>
          <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
            Your learning path will appear here
          </p>
          <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>
            Modules and progress — coming in Phase 1
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
