'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { SurveyRenderer, type ScoreResult } from '@/components/assessment/survey-renderer'

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
      setAssessmentError("Assessment couldn't load. Please refresh or try again later.")
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

    const { updateStreak } = await import('@/lib/streak')
    await updateStreak(supabase, userId)

    setStatus('completed')
    setLoading(false)
    router.refresh()
  }

  const handleAssessmentComplete = useCallback((result: ScoreResult) => {
    setShowAssessment(false)
    setAttempts((prev) => [{
      score: result.score,
      passed: result.passed,
      attempted_at: new Date().toISOString(),
    }, ...prev])

    if (result.passed) {
      setStatus('completed')
      router.refresh()
    } else {
      setStatus('failed')
    }
  }, [router])

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

  // Internal assessment — live SurveyJS
  if (moduleType === 'assessment') {
    if (assessmentError) {
      return (
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#1E293B', color: '#DC2626' }}>
          {assessmentError}
        </div>
      )
    }

    if (!assessment) {
      return (
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1E293B' }}>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Loading assessment...</p>
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
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              Best score: {Math.round(Math.max(...attempts.filter(a => a.passed).map(a => a.score)))}%
            </p>
          </div>
          <button
            onClick={() => setShowAssessment(true)}
            className="w-full rounded-lg py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: '#1E293B', color: '#9CA3AF', border: '1px solid #374151' }}
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
        <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {assessment.pass_score}% to pass
            {assessment.time_limit_mins ? ` · ${assessment.time_limit_mins} minute time limit` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAssessment(true)}
          className="w-full rounded-lg py-3 text-sm font-semibold text-center"
          style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
        >
          {attempts.length > 0 ? 'Try Again' : 'Start Assessment'}
        </button>
        {attempts.length > 0 && <PreviousAttempts attempts={attempts} />}
      </div>
    )
  }

  return null
}

function PreviousAttempts({ attempts }: { attempts: AttemptData[] }) {
  if (attempts.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>Previous attempts</p>
      {attempts.map((a, i) => (
        <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 text-xs" style={{ backgroundColor: '#1E293B' }}>
          <span style={{ color: '#9CA3AF' }}>
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
