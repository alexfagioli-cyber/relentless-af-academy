import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

const TIER_COLOURS: Record<string, string> = {
  aware: '#F59E0B',
  enabled: '#DC2626',
  specialist: '#8B5CF6',
}

const TIME_LABELS: Record<string, string> = {
  '1-2h': '1–2 hours per week',
  '3-5h': '3–5 hours per week',
  '5h+': '5+ hours per week',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('display_name, tier, streak_current, streak_longest, weekly_time_commitment, occupation, primary_goal')
    .eq('id', user.id)
    .single()

  // Count completed modules
  const { count: completedCount } = await supabase
    .from('progress')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', user.id)
    .eq('status', 'completed')

  const tier = profile?.tier ?? 'aware'
  const tierColour = TIER_COLOURS[tier] ?? '#DC2626'

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#E8F0FE' }}>
          Profile
        </h1>

        {/* Identity */}
        <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <p className="text-lg font-bold" style={{ color: '#E8F0FE' }}>
            {profile?.display_name ?? 'Learner'}
          </p>
          <p className="text-sm mt-1" style={{ color: '#8BA3C4' }}>
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#122240', borderBottom: `2px solid ${tierColour}` }}>
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Tier</p>
            <p className="mt-1 text-sm font-semibold capitalize" style={{ color: tierColour }}>
              {tier}
            </p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Streak</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: '#E8F0FE' }}>
              {profile?.streak_current ?? 0}d
            </p>
            {(profile?.streak_longest ?? 0) > 0 && (
              <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                Best: {profile?.streak_longest}d
              </p>
            )}
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Done</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: '#E8F0FE' }}>
              {completedCount ?? 0}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-lg p-5 mb-4 space-y-4" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          {profile?.occupation && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Background</p>
              <p className="text-sm mt-1" style={{ color: '#E8F0FE' }}>{profile.occupation}</p>
            </div>
          )}
          {profile?.primary_goal && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Goal</p>
              <p className="text-sm mt-1" style={{ color: '#E8F0FE' }}>{profile.primary_goal}</p>
            </div>
          )}
          {profile?.weekly_time_commitment && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Time commitment</p>
              <p className="text-sm mt-1" style={{ color: '#E8F0FE' }}>
                {TIME_LABELS[profile.weekly_time_commitment] ?? profile.weekly_time_commitment}
              </p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <SignOutButton />
      </div>

      <BottomNav />
    </div>
  )
}
