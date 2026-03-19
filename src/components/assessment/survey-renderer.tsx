'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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

export interface QuestionReview {
  name: string
  yourAnswer: string | null
  correctAnswer: string | null
  correct: boolean
}

export interface ScoreResult {
  score: number
  passed: boolean
  total_questions: number
  correct_count: number
  review?: QuestionReview[]
}

// Custom dark theme matching RelentlessAF branding
const darkTheme = {
  cssVariables: {
    '--sjs-general-backcolor': '#25253D',
    '--sjs-general-backcolor-dark': '#1A1A2E',
    '--sjs-general-backcolor-dim': '#1A1A2E',
    '--sjs-general-backcolor-dim-light': '#25253D',
    '--sjs-general-forecolor': '#E8F0FE',
    '--sjs-general-forecolor-light': '#8BA3C4',
    '--sjs-general-dim-forecolor': '#8BA3C4',
    '--sjs-general-dim-forecolor-light': '#6B7280',
    '--sjs-primary-backcolor': '#E8C872',
    '--sjs-primary-backcolor-light': 'rgba(245, 158, 11, 0.15)',
    '--sjs-primary-backcolor-dark': '#C9A94E',
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
  const [showReview, setShowReview] = useState(false)
  const { celebrate } = useCelebration()
  const router = useRouter()

  // Build a name→title lookup from the survey JSON for readable question labels
  const questionLabels = useMemo(() => {
    const qs = (questions as { elements?: Array<{ name: string; title?: string }> }).elements ?? []
    const map: Record<string, string> = {}
    for (const q of qs) {
      map[q.name] = q.title ?? q.name
    }
    return map
  }, [questions])

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
      <div className="space-y-4 animate-fade-in">
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#25253D' }}>
          <div
            className="text-4xl font-bold mb-2 animate-reveal"
            style={{ color: result.passed ? '#22C55E' : '#E8C872' }}
          >
            {Math.round(result.score)}%
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: '#FFFFFF' }}>
            {result.passed ? 'Passed' : 'Not quite'}
          </p>
          <p className="text-sm mb-4" style={{ color: '#D4D4E8' }}>
            {result.correct_count} of {result.total_questions} correct
            {!result.passed && ` — you need ${passScore}% to pass`}
          </p>
          {result.passed ? (
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Module completed. Keep going.
            </p>
          ) : (
            <p className="text-sm" style={{ color: '#D4D4E8' }}>
              Review the material and try again when you&apos;re ready.
            </p>
          )}
        </div>

        {/* Show answers button */}
        {result.review && result.review.length > 0 && (
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full rounded-lg py-2 text-sm font-semibold"
            style={{ backgroundColor: '#25253D', color: '#D4D4E8', border: '1px solid #374151' }}
          >
            {showReview ? 'Hide Answers' : 'Show Answers'}
          </button>
        )}

        {/* Answer review */}
        {showReview && result.review && (
          <div className="space-y-2">
            {result.review.map((q, i) => (
              <div
                key={i}
                className="rounded-lg p-3 text-sm"
                style={{
                  backgroundColor: '#25253D',
                  border: `1px solid ${q.correct ? '#22C55E' : '#EF4444'}`,
                }}
              >
                <p className="font-medium mb-1" style={{ color: '#FFFFFF' }}>
                  {questionLabels[q.name] ?? `Question ${i + 1}`}
                </p>
                <p style={{ color: q.correct ? '#22C55E' : '#EF4444' }}>
                  Your answer: {q.yourAnswer ?? 'No answer'}
                  {q.correct ? ' ✓' : ' ✗'}
                </p>
                {!q.correct && q.correctAnswer && (
                  <p style={{ color: '#22C55E' }}>
                    Correct answer: {q.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={() => router.push('/learn')}
          className="w-full rounded-lg py-3 text-sm font-semibold text-center"
          style={{ backgroundColor: '#E8C872', color: '#FFFFFF' }}
        >
          Continue →
        </button>
      </div>
    )
  }

  // Show loading state while scoring
  if (submitting) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#25253D' }}>
        <p className="text-sm" style={{ color: '#D4D4E8' }}>Scoring your answers</p>
      </div>
    )
  }

  // Show error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#25253D', color: '#E8C872' }}>
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
          background-color: #1A1A2E !important;
        }
        .survey-dark-wrapper .sd-body {
          background-color: #1A1A2E !important;
        }
        .survey-dark-wrapper .sd-page {
          background-color: #1A1A2E !important;
        }
        .survey-dark-wrapper .sd-question__content {
          background-color: #25253D !important;
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
          background-color: #E8C872 !important;
          color: #E8F0FE !important;
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
