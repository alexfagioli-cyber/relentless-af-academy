'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Props {
  moduleId: string
  moduleType: string
  externalUrl: string | null
  platform: string | null
  currentStatus: string
  userId: string
}

export function ModuleActions({ moduleId, moduleType, externalUrl, platform, currentStatus, userId }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // On mount, mark as in_progress if not_started
  useEffect(() => {
    if (status === 'not_started') {
      markStarted()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function markStarted() {
    const supabase = createClient()

    // Upsert progress to in_progress
    await supabase
      .from('progress')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        attempts: 1,
      }, { onConflict: 'learner_id,module_id' })

    // Log started event
    await supabase
      .from('learning_events')
      .insert({
        learner_id: userId,
        verb: 'started',
        object_type: moduleType === 'assessment' ? 'assessment' : moduleType === 'challenge' ? 'challenge' : 'module',
        object_id: moduleId,
      })

    setStatus('in_progress')
  }

  async function markComplete() {
    setLoading(true)
    const supabase = createClient()

    // Update progress to completed
    const { error: progressError } = await supabase
      .from('progress')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        attempts: 1,
      }, { onConflict: 'learner_id,module_id' })

    if (progressError) {
      setLoading(false)
      return
    }

    // Log completed event
    await supabase
      .from('learning_events')
      .insert({
        learner_id: userId,
        verb: 'completed',
        object_type: moduleType === 'assessment' ? 'assessment' : moduleType === 'challenge' ? 'challenge' : 'module',
        object_id: moduleId,
      })

    // Update streak
    const { updateStreak } = await import('@/lib/streak')
    await updateStreak(supabase, userId)

    setStatus('completed')
    setLoading(false)
    router.refresh()
  }

  // External course
  if (externalUrl && platform !== 'internal') {
    return (
      <div className="space-y-4">
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity"
          style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
        >
          {status === 'completed' ? 'Revisit Course' : 'Start Course'} →
        </a>

        {status !== 'completed' && (
          <button
            onClick={markComplete}
            disabled={loading}
            className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#1E293B', color: '#9CA3AF', border: '1px solid #374151' }}
          >
            {loading ? 'Saving...' : "I've finished this course"}
          </button>
        )}

        <p className="text-xs text-center" style={{ color: '#6B7280' }}>
          This course may have moved. Try visiting {platform} directly if the link doesn&apos;t work.
        </p>
      </div>
    )
  }

  // Internal challenge
  if (moduleType === 'challenge') {
    return (
      <div className="space-y-4">
        {status !== 'completed' ? (
          <button
            onClick={markComplete}
            disabled={loading}
            className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
          >
            {loading ? 'Saving...' : 'Mark Challenge Complete'}
          </button>
        ) : (
          <div className="text-sm text-center" style={{ color: '#22C55E' }}>
            Challenge completed
          </div>
        )}
      </div>
    )
  }

  // Internal assessment — Phase 2 placeholder
  if (moduleType === 'assessment') {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1E293B' }}>
        <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
          Assessment coming in Phase 2
        </p>
        <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>
          For now, mark as complete when you feel ready to move on.
        </p>
        {status !== 'completed' && (
          <button
            onClick={markComplete}
            disabled={loading}
            className="mt-4 rounded-lg px-6 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
          >
            {loading ? 'Saving...' : 'Mark Complete'}
          </button>
        )}
      </div>
    )
  }

  return null
}
