'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { SurveyRenderer, type ScoreResult } from '@/components/assessment/survey-renderer'
import { useCelebration } from '@/components/ui/celebration-toast'
import type { CelebrationKey } from '@/lib/celebrations'

interface AssessmentData {
  id: string
  pass_score: number
  time_limit_mins: number | null
  questions: Record<string, unknown>
}

interface AttemptData {
  score: number
  passed: boolean
  attempted_at: string
}

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
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [attempts, setAttempts] = useState<AttemptData[]>([])
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)
  const router = useRouter()
  const { celebrate } = useCelebration()

  // On mount, mark as in_progress if not_started + fetch assessment data if assessment module
  useEffect(() => {
    if (status === 'not_started') {
      markStarted()
    }
    if (moduleType === 'assessment') {
      fetchAssessmentData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAssessmentData() {
    const supabase = createClient()

    // Fetch assessment for this module (strip correctAnswer before setting state)
    const { data: assessmentRow, error } = await supabase
      .from('assessments')
      .select('id, pass_score, time_limit_mins, questions')
      .eq('module_id', moduleId)
      .single()

    if (error || !assessmentRow) {
      setAssessmentError("Assessment didn't load. Refresh and try again.")
      return
    }

    // CRITICAL: Strip correctAnswer from questions before storing in client state
    const clientQuestions = JSON.parse(JSON.stringify(assessmentRow.questions))
    if (clientQuestions.elements) {
      for (const element of clientQuestions.elements) {
        delete element.correctAnswer
      }
    }

    setAssessment({
      id: assessmentRow.id,
      pass_score: assessmentRow.pass_score,
      time_limit_mins: assessmentRow.time_limit_mins,
      questions: clientQuestions,
    })

    // Fetch previous attempts
    const { data: prevAttempts } = await supabase
      .from('assessment_attempts')
      .select('score, passed, attempted_at')
      .eq('assessment_id', assessmentRow.id)
      .eq('learner_id', userId)
      .order('attempted_at', { ascending: false })

    setAttempts(prevAttempts ?? [])
  }

  async function markStarted() {
    const supabase = createClient()

    await supabase
      .from('progress')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        attempts: 1,
      }, { onConflict: 'learner_id,module_id' })

    await supabase
      .from('learning_events')
      .insert({
        learner_id: userId,
        verb: 'started',
        object_type: moduleType === 'assessment' ? 'assessment' : moduleType === 'challenge' ? 'challenge' : 'module',
        object_id: moduleId,
      })

    // Check if this is the learner's first module start
    const { count } = await supabase
      .from('learning_events')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', userId)
      .eq('verb', 'started')
    if (count === 1) celebrate('first_module_started')

    setStatus('in_progress')
  }

  async function markComplete() {
    setLoading(true)
    const supabase = createClient()

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

    await supabase
      .from('learning_events')
      .insert({
        learner_id: userId,
        verb: 'completed',
        object_type: moduleType === 'assessment' ? 'assessment' : moduleType === 'challenge' ? 'challenge' : 'module',
        object_id: moduleId,
      })

    // Check if this is the learner's first module completion
    const { count } = await supabase
      .from('learning_events')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', userId)
      .eq('verb', 'completed')
    if (count === 1) celebrate('first_module_completed')

    // Update streak and check milestones
    const { updateStreak } = await import('@/lib/streak')
    const newStreak = await updateStreak(supabase, userId)
    if (newStreak === 3) celebrate('streak_3')
    if (newStreak === 7) celebrate('streak_7')

    // Check tier completion
    await checkTierCelebrations(supabase, userId, moduleId, celebrate)

    setStatus('completed')
    setLoading(false)
    router.refresh()
  }

  const handleAssessmentComplete = useCallback(async (result: ScoreResult) => {
    setShowAssessment(false)
    setAttempts((prev) => [{
      score: result.score,
      passed: result.passed,
      attempted_at: new Date().toISOString(),
    }, ...prev])

    if (result.passed) {
      setStatus('completed')

      // Check streak milestone (streak was updated by the API route)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('streak_current')
        .eq('id', userId)
        .single()
      if (profile?.streak_current === 3) celebrate('streak_3')
      if (profile?.streak_current === 7) celebrate('streak_7')

      // Check tier completion
      await checkTierCelebrations(supabase, userId, moduleId, celebrate)

      router.refresh()
    } else {
      setStatus('failed')
    }
  }, [router, userId, moduleId, celebrate])

  // External course
  if (externalUrl && platform !== 'internal') {
    return (
      <div className="space-y-4">
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity"
          style={{ backgroundColor: '#DC2626', color: '#E8F0FE' }}
        >
          {status === 'completed' ? 'Revisit Course' : 'Start This'} →
        </a>

        {status !== 'completed' && (
          <button
            onClick={markComplete}
            disabled={loading}
            className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#122240', color: '#8BA3C4', border: '1px solid #374151' }}
          >
            {loading ? 'Saving' : "I've finished this course"}
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
    return <ChallengeActions status={status} loading={loading} userId={userId} moduleId={moduleId} onComplete={markComplete} />
  }

  // Internal assessment — live SurveyJS
  if (moduleType === 'assessment') {
    if (assessmentError) {
      return (
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#122240', color: '#DC2626' }}>
          {assessmentError}
        </div>
      )
    }

    if (!assessment) {
      return (
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <p className="text-sm" style={{ color: '#8BA3C4' }}>Loading assessment...</p>
        </div>
      )
    }

    // Show the survey if user clicked Start/Retry
    if (showAssessment) {
      return (
        <SurveyRenderer
          assessmentId={assessment.id}
          questions={assessment.questions}
          timeLimit={assessment.time_limit_mins}
          passScore={assessment.pass_score}
          onComplete={handleAssessmentComplete}
        />
      )
    }

    // Already passed
    const hasPassed = attempts.some((a) => a.passed)

    if (hasPassed) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#14532D' }}>
            <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>Passed</p>
            <p className="text-xs mt-1" style={{ color: '#8BA3C4' }}>
              Best score: {Math.round(Math.max(...attempts.filter(a => a.passed).map(a => a.score)))}%
            </p>
          </div>
          <button
            onClick={() => setShowAssessment(true)}
            className="w-full rounded-lg py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: '#122240', color: '#8BA3C4', border: '1px solid #374151' }}
          >
            Retake for practice
          </button>
          <PreviousAttempts attempts={attempts} />
        </div>
      )
    }

    // Failed or not yet attempted
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <p className="text-sm" style={{ color: '#8BA3C4' }}>
            {assessment.pass_score}% to pass
            {assessment.time_limit_mins ? ` · ${assessment.time_limit_mins} minute time limit` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAssessment(true)}
          className="w-full rounded-lg py-3 text-sm font-semibold text-center"
          style={{ backgroundColor: '#DC2626', color: '#E8F0FE' }}
        >
          {attempts.length > 0 ? 'Go Again' : 'Start Assessment'}
        </button>
        {attempts.length > 0 && <PreviousAttempts attempts={attempts} />}
      </div>
    )
  }

  return null
}

async function checkTierCelebrations(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  completedModuleId: string,
  celebrate: (key: CelebrationKey) => void,
) {
  // Fetch all modules and the learner's progress
  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase.from('modules').select('id, tier'),
    supabase.from('progress').select('module_id, status').eq('learner_id', userId),
  ])
  if (!modules || !progress) return

  const completedIds = new Set(
    progress.filter((p) => p.status === 'completed').map((p) => p.module_id),
  )

  // Find which tier the just-completed module belongs to
  const completedModule = modules.find((m) => m.id === completedModuleId)
  if (!completedModule) return

  const currentTier = completedModule.tier
  const tierModules = modules.filter((m) => m.tier === currentTier)

  // Check if ALL modules in this tier are now completed
  const allComplete = tierModules.every((m) => completedIds.has(m.id))
  if (!allComplete) return

  celebrate('tier_complete')

  // Fire tier transition celebration
  if (currentTier === 'aware') celebrate('tier_aware_to_enabled')
  if (currentTier === 'enabled') celebrate('tier_enabled_to_specialist')
}

function ChallengeActions({
  status,
  loading,
  userId,
  moduleId,
  onComplete,
}: {
  status: string
  loading: boolean
  userId: string
  moduleId: string
  onComplete: () => Promise<void>
}) {
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    setSaving(true)
    if (reflection.trim()) {
      const supabase = createClient()
      await supabase
        .from('challenge_responses')
        .upsert({
          learner_id: userId,
          module_id: moduleId,
          responses: { reflection },
        }, { onConflict: 'learner_id,module_id' })
    }
    await onComplete()
    setSaving(false)
  }

  if (status === 'completed') {
    return (
      <div className="text-sm text-center" style={{ color: '#22C55E' }}>
        Challenge completed
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Write your reflection here — what you did, what you learned, what surprised you..."
        rows={5}
        className="w-full rounded-lg px-3 py-3 text-sm outline-none resize-none"
        style={{
          backgroundColor: '#0A1628',
          color: '#E8F0FE',
          border: '1px solid #374151',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || saving}
        className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
        style={{ backgroundColor: '#DC2626', color: '#E8F0FE' }}
      >
        {loading || saving ? 'Saving' : 'Done — Move On'}
      </button>
    </div>
  )
}

function PreviousAttempts({ attempts }: { attempts: AttemptData[] }) {
  if (attempts.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Previous attempts</p>
      {attempts.map((a, i) => (
        <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 text-xs" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
          <span style={{ color: '#8BA3C4' }}>
            {new Date(a.attempted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <span style={{ color: a.passed ? '#22C55E' : '#DC2626' }}>
            {Math.round(a.score)}% — {a.passed ? 'Passed' : 'Failed'}
          </span>
        </div>
      ))}
    </div>
  )
}
