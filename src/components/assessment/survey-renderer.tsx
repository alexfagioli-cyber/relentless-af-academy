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
    '--sjs-general-backcolor': '#122240',
    '--sjs-general-backcolor-dark': '#0A1628',
    '--sjs-general-backcolor-dim': '#0A1628',
    '--sjs-general-backcolor-dim-light': '#122240',
    '--sjs-general-forecolor': '#E8F0FE',
    '--sjs-general-forecolor-light': '#8BA3C4',
    '--sjs-general-dim-forecolor': '#8BA3C4',
    '--sjs-general-dim-forecolor-light': '#6B7280',
    '--sjs-primary-backcolor': '#F59E0B',
    '--sjs-primary-backcolor-light': 'rgba(245, 158, 11, 0.15)',
    '--sjs-primary-backcolor-dark': '#D97706',
    '--sjs-primary-forecolor': '#E8F0FE',
    '--sjs-primary-forecolor-light': '#E8F0FE',
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
      <div className="rounded-lg p-6 text-center animate-fade-in" style={{ backgroundColor: '#122240' }}>
        <div
          className="text-4xl font-bold mb-2 animate-reveal"
          style={{ color: result.passed ? '#22C55E' : '#F59E0B' }}
        >
          {Math.round(result.score)}%
        </div>
        <p className="text-lg font-semibold mb-1" style={{ color: '#E8F0FE' }}>
          {result.passed ? 'Passed' : 'Not quite'}
        </p>
        <p className="text-sm mb-4" style={{ color: '#8BA3C4' }}>
          {result.correct_count} of {result.total_questions} correct
          {!result.passed && ` — you need ${passScore}% to pass`}
        </p>
        {result.passed ? (
          <p className="text-sm" style={{ color: '#22C55E' }}>
            Module completed. Keep going.
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#8BA3C4' }}>
            Review the material and try again when you&apos;re ready.
          </p>
        )}
      </div>
    )
  }

  // Show loading state while scoring
  if (submitting) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#122240' }}>
        <p className="text-sm" style={{ color: '#8BA3C4' }}>Scoring your answers</p>
      </div>
    )
  }

  // Show error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#122240', color: '#F59E0B' }}>
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
          background-color: #0A1628 !important;
        }
        .survey-dark-wrapper .sd-body {
          background-color: #0A1628 !important;
        }
        .survey-dark-wrapper .sd-page {
          background-color: #0A1628 !important;
        }
        .survey-dark-wrapper .sd-question__content {
          background-color: #122240 !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }
        .survey-dark-wrapper .sd-item__control-label {
          color: #E8F0FE !important;
        }
        .survey-dark-wrapper .sd-selectbase__label {
          color: #8BA3C4 !important;
        }
        .survey-dark-wrapper .sd-btn {
          background-color: #F59E0B !important;
          color: #E8F0FE !important;
          border: none !important;
          border-radius: 8px !important;
        }
        .survey-dark-wrapper .sd-btn:hover {
          background-color: #D97706 !important;
        }
      `}</style>
    </div>
  )
}
