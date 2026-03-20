'use client'

import { createClient } from '@/lib/supabase/client'
import { QUESTION_OPTIONS, getQ4Key, computeTier } from '@/lib/tier-logic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TIME_OPTIONS = ['1-2h', '3-5h', '5h+'] as const

interface StepProps {
  responses: Record<string, number>
  onSelect: (key: string, index: number) => void
}

function QuestionCard({
  questionKey,
  label,
  responses,
  onSelect,
}: {
  questionKey: string
  label: string
  responses: Record<string, number>
  onSelect: (key: string, index: number) => void
}) {
  const options = QUESTION_OPTIONS[questionKey]
  if (!options) return null

  return (
    <div className="space-y-3">
      <p className="text-base font-medium" style={{ color: '#FFFFFF' }}>{label}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const selected = responses[questionKey] === i
          return (
            <button
              key={i}
              onClick={() => onSelect(questionKey, i)}
              className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all"
              style={{
                backgroundColor: selected ? '#E8C872' : '#25253D',
                color: selected ? '#E8F0FE' : '#8BA3C4',
                border: selected ? '1px solid #E8C872' : '1px solid #374151',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Step1({ responses, onSelect }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Welcome</h2>
        <p className="mt-1 text-sm" style={{ color: '#D4D4E8' }}>Let&apos;s understand what you&apos;re looking for.</p>
      </div>
      <QuestionCard questionKey="motivation" label="What brings you to RelentlessAF Academy?" responses={responses} onSelect={onSelect} />
      <QuestionCard questionKey="background" label="What best describes you right now?" responses={responses} onSelect={onSelect} />
    </div>
  )
}

function Step2({ responses, onSelect }: StepProps) {
  const q4Key = responses.ai_familiarity !== undefined ? getQ4Key(responses.ai_familiarity) : null

  const q4Labels: Record<string, string> = {
    ai_concept: 'What do you think AI is best at?',
    ai_usage: 'What have you mainly used AI for?',
    ai_depth: 'Which of these have you done?',
    ai_building: 'What have you built with AI?',
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>AI Knowledge</h2>
        <p className="mt-1 text-sm" style={{ color: '#D4D4E8' }}>No right or wrong answers — just where you are now.</p>
      </div>
      <QuestionCard questionKey="ai_familiarity" label="Have you used any AI tool before? (ChatGPT, Claude, Copilot, Gemini)" responses={responses} onSelect={onSelect} />
      {q4Key && (
        <QuestionCard questionKey={q4Key} label={q4Labels[q4Key]} responses={responses} onSelect={onSelect} />
      )}
      {responses.ai_familiarity !== undefined && (
        <>
          <QuestionCard questionKey="prompt_knowledge" label='A "prompt" in AI is...' responses={responses} onSelect={onSelect} />
          <QuestionCard questionKey="ai_limitations" label="Which of these is true about AI?" responses={responses} onSelect={onSelect} />
          <QuestionCard questionKey="code_comfort" label="How comfortable are you with code or technical tools?" responses={responses} onSelect={onSelect} />
        </>
      )}
    </div>
  )
}

function Step3({ responses, onSelect, timeCommitment, onTimeSelect }: StepProps & {
  timeCommitment: string | null
  onTimeSelect: (val: string) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Goals</h2>
        <p className="mt-1 text-sm" style={{ color: '#D4D4E8' }}>Where do you want to end up?</p>
      </div>
      <QuestionCard questionKey="success_vision" label="What would success look like for you?" responses={responses} onSelect={onSelect} />
      <div className="space-y-3">
        <p className="text-base font-medium" style={{ color: '#FFFFFF' }}>How much time can you commit per week?</p>
        <div className="space-y-2">
          {TIME_OPTIONS.map((opt) => {
            const selected = timeCommitment === opt
            const labels: Record<string, string> = { '1-2h': '1–2 hours', '3-5h': '3–5 hours', '5h+': '5+ hours' }
            return (
              <button
                key={opt}
                onClick={() => onTimeSelect(opt)}
                className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all"
                style={{
                  backgroundColor: selected ? '#E8C872' : '#25253D',
                  color: selected ? '#E8F0FE' : '#8BA3C4',
                  border: selected ? '1px solid #E8C872' : '1px solid #374151',
                }}
              >
                {labels[opt]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [timeCommitment, setTimeCommitment] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSelect(key: string, index: number) {
    setResponses((prev) => {
      const next = { ...prev, [key]: index }
      // If ai_familiarity changed, clear the old Q4 answer
      if (key === 'ai_familiarity') {
        delete next.ai_concept
        delete next.ai_usage
        delete next.ai_depth
        delete next.ai_building
      }
      return next
    })
  }

  function canAdvance(): boolean {
    if (step === 0) {
      return responses.motivation !== undefined && responses.background !== undefined
    }
    if (step === 1) {
      if (responses.ai_familiarity === undefined) return false
      const q4Key = getQ4Key(responses.ai_familiarity)
      if (q4Key && responses[q4Key] === undefined) return false
      return responses.prompt_knowledge !== undefined &&
        responses.ai_limitations !== undefined &&
        responses.code_comfort !== undefined
    }
    if (step === 2) {
      return responses.success_vision !== undefined && timeCommitment !== null
    }
    return false
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { tier } = computeTier(responses)

      // Get display name from user metadata or email
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Learner'

      // Save learner profile FIRST (most critical — this is what unblocks the user)
      const motivationOptions = QUESTION_OPTIONS.motivation
      const successOptions = QUESTION_OPTIONS.success_vision
      const backgroundOptions = QUESTION_OPTIONS.background

      const profileData = {
        id: user.id,
        display_name: displayName,
        tier,
        onboarding_complete: true,
        weekly_time_commitment: timeCommitment,
        primary_goal: successOptions[responses.success_vision]?.label ?? null,
        learning_motivation: motivationOptions[responses.motivation]?.label ?? null,
        occupation: backgroundOptions[responses.background]?.label ?? null,
      }

      const { error: profileError } = await supabase
        .from('learner_profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile save failed:', profileError.message, profileError.details, profileError.hint)
        throw profileError
      }

      // Save onboarding responses (non-blocking — profile is already saved)
      const validKeys = new Set(Object.keys(QUESTION_OPTIONS))
      const responseRows = Object.entries(responses)
        .filter(([questionKey]) => validKeys.has(questionKey))
        .map(([questionKey, optionIndex]) => ({
          learner_id: user.id,
          question_key: questionKey,
          response: { option_index: optionIndex },
        }))

      const { error: responseError } = await supabase
        .from('onboarding_responses')
        .upsert(responseRows, { onConflict: 'learner_id,question_key' })

      if (responseError) {
        // Log but don't block — profile is saved, user can proceed
        console.error('Onboarding responses save failed:', responseError.message)
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const steps = [
    <Step1 key="step1" responses={responses} onSelect={handleSelect} />,
    <Step2 key="step2" responses={responses} onSelect={handleSelect} />,
    <Step3 key="step3" responses={responses} onSelect={handleSelect} timeCommitment={timeCommitment} onTimeSelect={setTimeCommitment} />,
  ]

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i <= step ? '#E8C872' : '#374151' }}
            />
          ))}
        </div>

        {/* Step content */}
        <div key={step} className="animate-slide-in">
          {steps[step]}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md p-3 text-sm" style={{ backgroundColor: '#25253D', color: '#E8C872' }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-lg py-3 text-sm font-semibold"
              style={{ backgroundColor: '#25253D', color: '#D4D4E8', border: '1px solid #374151' }}
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex-1 rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ backgroundColor: '#E8C872', color: '#FFFFFF' }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance() || submitting}
              className="flex-1 rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ backgroundColor: '#E8C872', color: '#FFFFFF' }}
            >
              {submitting ? 'Setting up your path' : "Let's Go"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
