import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ModuleActions } from './module-actions'
import { InternalCourse } from './internal-course'
import { VerifyCert } from './verify-cert'
import { ModuleFeedback } from '@/components/feedback/module-feedback'
import { ChallengeGallery } from './challenge-gallery'
import { VideoPlaceholder } from '@/components/ui/video-placeholder'

const PLATFORM_LABELS: Record<string, string> = {
  skilljar: 'Anthropic Academy (Skilljar)',
  github: 'Anthropic GitHub Courses',
  coursera: 'Coursera',
  claudecertifications: 'Claude Certifications',
  internal: 'RelentlessAF Academy',
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} minutes`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
}

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch module
  const { data: mod } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single()

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'transparent' }}>
        <div className="text-center">
          <p className="text-lg font-medium" style={{ color: '#E8F0FE' }}>Module not found</p>
          <Link href="/learn" className="mt-4 inline-block text-sm" style={{ color: '#E8C872' }}>
            Back to learning path
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Fetch progress
  const { data: progress } = await supabase
    .from('progress')
    .select('status, started_at, completed_at')
    .eq('learner_id', user.id)
    .eq('module_id', moduleId)
    .single()

  // If no progress row yet, create one as in_progress and log started event
  const currentStatus = progress?.status ?? 'not_started'

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Back link */}
        <Link href="/learn" className="text-sm mb-6 inline-block" style={{ color: '#8BA3C4' }}>
          ← Back to learning path
        </Link>

        {/* Module header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded" style={{ backgroundColor: '#25253D', color: '#8BA3C4' }}>
              {mod.module_type}
            </span>
            <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded" style={{ backgroundColor: '#25253D', color: '#8BA3C4' }}>
              {mod.tier}
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#E8F0FE' }}>
            {mod.title}
          </h1>
        </div>

        {/* Details */}
        <div className="rounded-lg p-4 mb-6 space-y-3" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
          {mod.description && (
            <p className="text-sm" style={{ color: '#8BA3C4' }}>
              {mod.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#6B7280' }}>
            {mod.estimated_duration_mins && (
              <span>Duration: {formatDuration(mod.estimated_duration_mins)}</span>
            )}
            {mod.platform && (
              <span>Platform: {PLATFORM_LABELS[mod.platform] ?? mod.platform}</span>
            )}
          </div>
        </div>

        {/* Status banner */}
        {currentStatus === 'completed' && (
          <div className="rounded-lg p-3 mb-6 text-sm font-medium text-center" style={{ backgroundColor: '#14532D', color: '#22C55E' }}>
            Completed {progress?.completed_at ? `on ${new Date(progress.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
          </div>
        )}

        {/* Video placeholder for internal modules */}
        {mod.platform === 'internal' && (
          <VideoPlaceholder videoUrl={mod.video_url} />
        )}

        {/* Internal course — screen-based content */}
        {mod.platform === 'internal' && mod.module_type === 'course' && mod.content?.screens ? (
          <InternalCourse
            moduleId={mod.id}
            userId={user.id}
            screens={mod.content.screens}
            currentStatus={currentStatus}
          />
        ) : (
          /* Actions — external courses, challenges, assessments */
          <ModuleActions
            moduleId={mod.id}
            moduleType={mod.module_type}
            externalUrl={mod.external_url}
            platform={mod.platform}
            currentStatus={currentStatus}
            userId={user.id}
          />
        )}

        {/* Certificate verification for Skilljar courses */}
        {mod.platform === 'skilljar' && currentStatus !== 'completed' && (
          <div className="mt-4">
            <VerifyCert moduleId={mod.id} userId={user.id} platform={mod.platform} />
          </div>
        )}

        {/* Challenge gallery — shared responses */}
        {mod.module_type === 'challenge' && (
          <ChallengeGallery moduleId={mod.id} />
        )}

        {/* Feedback — shown after completion */}
        {currentStatus === 'completed' && (
          <ModuleFeedback moduleId={mod.id} userId={user.id} />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
