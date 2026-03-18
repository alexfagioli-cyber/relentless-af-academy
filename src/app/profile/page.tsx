import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'
import { NotificationPreferences } from './notifications'
import { BadgeWall } from './badges'
import { checkAndAwardBadges } from '@/lib/badges'

const TIER_COLOURS: Record<string, string> = {
  aware: '#E8C872',
  enabled: '#E8C872',
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

  // Check and award any new badges, then fetch all
  await checkAndAwardBadges(supabase, user.id)
  const { data: badges } = await supabase
    .from('badges')
    .select('badge_key')
    .eq('learner_id', user.id)
  const earnedBadgeKeys = (badges ?? []).map((b) => b.badge_key)

  const tier = profile?.tier ?? 'aware'
  const tierColour = TIER_COLOURS[tier] ?? '#E8C872'

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
          Profile
        </h1>

        {/* Identity */}
        <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
          <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            {profile?.display_name ?? 'Learner'}
          </p>
          <p className="text-sm mt-1" style={{ color: '#D4D4E8' }}>
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#25253D', borderBottom: `2px solid ${tierColour}` }}>
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Tier</p>
            <p className="mt-1 text-sm font-semibold capitalize" style={{ color: tierColour }}>
              {tier}
            </p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Streak</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {profile?.streak_current ?? 0}d
            </p>
            {(profile?.streak_longest ?? 0) > 0 && (
              <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                Best: {profile?.streak_longest}d
              </p>
            )}
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
            <p className="text-xs" style={{ color: '#D4D4E8' }}>Done</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {completedCount ?? 0}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-lg p-5 mb-4 space-y-4" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
          {profile?.occupation && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Background</p>
              <p className="text-sm mt-1" style={{ color: '#FFFFFF' }}>{profile.occupation}</p>
            </div>
          )}
          {profile?.primary_goal && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Goal</p>
              <p className="text-sm mt-1" style={{ color: '#FFFFFF' }}>{profile.primary_goal}</p>
            </div>
          )}
          {profile?.weekly_time_commitment && (
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Time commitment</p>
              <p className="text-sm mt-1" style={{ color: '#FFFFFF' }}>
                {TIME_LABELS[profile.weekly_time_commitment] ?? profile.weekly_time_commitment}
              </p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mb-4">
          <BadgeWall earnedKeys={earnedBadgeKeys} />
        </div>

        {/* Notifications */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4D4E8' }}>
            Notifications
          </h2>
          <NotificationPreferences userId={user.id} />
        </div>

        {/* Sign out */}
        <SignOutButton />
      </div>

      <BottomNav />
    </div>
  )
}
