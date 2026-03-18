'use client'

import { useState, useCallback } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import 'survey-core/survey-core.min.css'
import { createClient } from '@/lib/supabase/client'
import { useCelebration } from '@/components/ui/celebration-toast'

interface SurveyRendererProps {
  assessmentId: string
  questions: Record<string, unknown> // SurveyJS JSON (no correctAnswer — stripped server-side)
  timeLimit: number | null
  passScore: number
  onComplete: (result: ScoreResult) => void
}

export interface ScoreResult {
  score: number
  passed: boolean
  total_questions: number
  correct_count: number
}

// Custom dark theme matching RelentlessAF branding
const darkTheme = {
  cssVariables: {
    '--sjs-general-backcolor': '#FFFFFF',
    '--sjs-general-backcolor-dark': '#F8FAFC',
    '--sjs-general-backcolor-dim': '#F8FAFC',
    '--sjs-general-backcolor-dim-light': '#FFFFFF',
    '--sjs-general-forecolor': '#1E293B',
    '--sjs-general-forecolor-light': '#64748B',
    '--sjs-general-dim-forecolor': '#64748B',
    '--sjs-general-dim-forecolor-light': '#6B7280',
    '--sjs-primary-backcolor': '#E8C872',
    '--sjs-primary-backcolor-light': 'rgba(245, 158, 11, 0.15)',
    '--sjs-primary-backcolor-dark': '#C9A94E',
    '--sjs-primary-forecolor': '#1E293B',
    '--sjs-primary-forecolor-light': '#1E293B',
    '--sjs-base-unit': '8px',
    '--sjs-corner-radius': '8px',
    '--sjs-shadow-small': 'none',
    '--sjs-shadow-medium': 'none',
    '--sjs-shadow-large': 'none',
    '--sjs-border-default': '#E2E8F0',
    '--sjs-border-light': '#E2E8F0',
  },
  isPanelless: true,
}

export function SurveyRenderer({ assessmentId, questions, timeLimit, passScore, onComplete }: SurveyRendererProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const { celebrate } = useCelebration()

  const handleComplete = useCallback(async (sender: Model) => {
    setSubmitting(true)
    setError(null)

    try {
      const answers = sender.data

      const res = await fetch('/api/assess/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, answers }),
      })

      if (!res.ok) {
        throw new Error('Scoring failed. Please try again.')
      }

      const scoreResult: ScoreResult = await res.json()
      setResult(scoreResult)

      // Check if this is the learner's first pass or fail
      const supabase = createClient()
      const verb = scoreResult.passed ? 'passed' : 'failed'
      const { count } = await supabase
        .from('learning_events')
        .select('*', { count: 'exact', head: true })
        .eq('verb', verb)
      if (count === 1) {
        celebrate(scoreResult.passed ? 'first_assessment_passed' : 'first_assessment_failed')
      }

      onComplete(scoreResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [assessmentId, onComplete])

  // Show result screen
  if (result) {
    return (
      <div className="rounded-lg p-6 text-center animate-fade-in" style={{ backgroundColor: '#FFFFFF' }}>
        <div
          className="text-4xl font-bold mb-2 animate-reveal"
          style={{ color: result.passed ? '#22C55E' : '#E8C872' }}
        >
          {Math.round(result.score)}%
        </div>
        <p className="text-lg font-semibold mb-1" style={{ color: '#1E293B' }}>
          {result.passed ? 'Passed' : 'Not quite'}
        </p>
        <p className="text-sm mb-4" style={{ color: '#64748B' }}>
          {result.correct_count} of {result.total_questions} correct
          {!result.passed && ` — you need ${passScore}% to pass`}
        </p>
        {result.passed ? (
          <p className="text-sm" style={{ color: '#22C55E' }}>
            Module completed. Keep going.
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#64748B' }}>
            Review the material and try again when you&apos;re ready.
          </p>
        )}
      </div>
    )
  }

  // Show loading state while scoring
  if (submitting) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-sm" style={{ color: '#64748B' }}>Scoring your answers</p>
      </div>
    )
  }

  // Show error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#FFFFFF', color: '#E8C872' }}>
          {error}
        </div>
      </div>
    )
  }

  // Render survey
  const survey = new Model(questions)
  survey.applyTheme(darkTheme as Parameters<typeof survey.applyTheme>[0])

  if (timeLimit) {
    survey.maxTimeToFinish = timeLimit * 60 // convert minutes to seconds
    survey.showTimerPanel = 'top'
    survey.showTimerPanelMode = 'survey'
  }

  survey.completeText = 'Submit Assessment'
  survey.showProgressBar = 'top'
  survey.progressBarType = 'questions'
  survey.onComplete.add(handleComplete)

  return (
    <div className="survey-dark-wrapper">
      <Survey model={survey} />
      <style jsx global>{`
        .survey-dark-wrapper .sd-root-modern {
          background-color: #F8FAFC !important;
        }
        .survey-dark-wrapper .sd-body {
          background-color: #F8FAFC !important;
        }
        .survey-dark-wrapper .sd-page {
          background-color: #F8FAFC !important;
        }
        .survey-dark-wrapper .sd-question__content {
          background-color: #FFFFFF !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }
        .survey-dark-wrapper .sd-item__control-label {
          color: #1E293B !important;
        }
        .survey-dark-wrapper .sd-selectbase__label {
          color: #64748B !important;
        }
        .survey-dark-wrapper .sd-btn {
          background-color: #E8C872 !important;
          color: #1E293B !important;
          border: none !important;
          border-radius: 8px !important;
        }
        .survey-dark-wrapper .sd-btn:hover {
          background-color: #C9A94E !important;
        }
      `}</style>
    </div>
  )
}
