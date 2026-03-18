'use client'

import { useState, useCallback } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import 'survey-core/survey-core.min.css'

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
    '--sjs-general-backcolor': '#1E293B',
    '--sjs-general-backcolor-dark': '#111827',
    '--sjs-general-backcolor-dim': '#111827',
    '--sjs-general-backcolor-dim-light': '#1E293B',
    '--sjs-general-forecolor': '#F9FAFB',
    '--sjs-general-forecolor-light': '#9CA3AF',
    '--sjs-general-dim-forecolor': '#9CA3AF',
    '--sjs-general-dim-forecolor-light': '#6B7280',
    '--sjs-primary-backcolor': '#DC2626',
    '--sjs-primary-backcolor-light': 'rgba(220, 38, 38, 0.15)',
    '--sjs-primary-backcolor-dark': '#B91C1C',
    '--sjs-primary-forecolor': '#F9FAFB',
    '--sjs-primary-forecolor-light': '#F9FAFB',
    '--sjs-base-unit': '8px',
    '--sjs-corner-radius': '8px',
    '--sjs-shadow-small': 'none',
    '--sjs-shadow-medium': 'none',
    '--sjs-shadow-large': 'none',
    '--sjs-border-default': '#374151',
    '--sjs-border-light': '#374151',
  },
  isPanelless: true,
}

export function SurveyRenderer({ assessmentId, questions, timeLimit, passScore, onComplete }: SurveyRendererProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)

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
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1E293B' }}>
        <div
          className="text-4xl font-bold mb-2"
          style={{ color: result.passed ? '#22C55E' : '#DC2626' }}
        >
          {Math.round(result.score)}%
        </div>
        <p className="text-lg font-semibold mb-1" style={{ color: '#F9FAFB' }}>
          {result.passed ? 'Passed' : 'Not quite'}
        </p>
        <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
          {result.correct_count} of {result.total_questions} correct
          {!result.passed && ` — you need ${passScore}% to pass`}
        </p>
        {result.passed ? (
          <p className="text-sm" style={{ color: '#22C55E' }}>
            Module completed. Keep going.
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Review the material and try again when you&apos;re ready.
          </p>
        )}
      </div>
    )
  }

  // Show loading state while scoring
  if (submitting) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1E293B' }}>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Scoring your answers...</p>
      </div>
    )
  }

  // Show error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#1E293B', color: '#DC2626' }}>
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
          background-color: #111827 !important;
        }
        .survey-dark-wrapper .sd-body {
          background-color: #111827 !important;
        }
        .survey-dark-wrapper .sd-page {
          background-color: #111827 !important;
        }
        .survey-dark-wrapper .sd-question__content {
          background-color: #1E293B !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }
        .survey-dark-wrapper .sd-item__control-label {
          color: #F9FAFB !important;
        }
        .survey-dark-wrapper .sd-selectbase__label {
          color: #9CA3AF !important;
        }
        .survey-dark-wrapper .sd-btn {
          background-color: #DC2626 !important;
          color: #F9FAFB !important;
          border: none !important;
          border-radius: 8px !important;
        }
        .survey-dark-wrapper .sd-btn:hover {
          background-color: #B91C1C !important;
        }
      `}</style>
    </div>
  )
}
