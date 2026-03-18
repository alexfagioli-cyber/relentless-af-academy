'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useCelebration } from '@/components/ui/celebration-toast'

interface ScreenInput {
  key: string
  type: 'textarea' | 'radio' | 'checkbox'
  label: string
  placeholder?: string
  options?: string[]
}

interface Screen {
  title: string
  body: string
  action?: string
  action_label?: string
  action_url?: string
  inputs?: ScreenInput[]
}

interface Props {
  moduleId: string
  userId: string
  screens: Screen[]
  currentStatus: string
}

export function InternalCourse({ moduleId, userId, screens, currentStatus }: Props) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(currentStatus === 'completed')
  const router = useRouter()
  const { celebrate } = useCelebration()

  const screen = screens[currentScreen]
  const isLast = currentScreen === screens.length - 1
  const isFirst = currentScreen === 0

  const updateResponse = useCallback((key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Check if current screen's required inputs are filled
  const canProceed = useCallback(() => {
    if (!screen.inputs) return true
    return screen.inputs.every((input) => {
      const val = responses[input.key]
      return val && val.trim().length > 0
    })
  }, [screen, responses])

  async function handleComplete() {
    setSaving(true)
    const supabase = createClient()

    // Save responses if any
    if (Object.keys(responses).length > 0) {
      await supabase
        .from('challenge_responses')
        .upsert({
          learner_id: userId,
          module_id: moduleId,
          responses,
        }, { onConflict: 'learner_id,module_id' })
    }

    // Mark module complete
    await supabase
      .from('progress')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        attempts: 1,
      }, { onConflict: 'learner_id,module_id' })

    await supabase
      .from('learning_events')
      .insert({
        learner_id: userId,
        verb: 'completed',
        object_type: 'module',
        object_id: moduleId,
      })

    // Check if first completion
    const { count } = await supabase
      .from('learning_events')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', userId)
      .eq('verb', 'completed')
    if (count === 1) celebrate('first_module_completed')

    // Update streak
    const { updateStreak } = await import('@/lib/streak')
    const newStreak = await updateStreak(supabase, userId)
    if (newStreak === 3) celebrate('streak_3')
    if (newStreak === 7) celebrate('streak_7')

    setCompleted(true)
    setSaving(false)
    router.refresh()
  }

  if (completed) {
    return (
      <div className="rounded-lg p-6 text-center animate-fade-in" style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}>
        <p className="text-lg font-semibold" style={{ color: '#22C55E' }}>Complete</p>
        <p className="mt-2 text-sm" style={{ color: '#8BA3C4' }}>
          You&apos;re ready to move on to the next module.
        </p>
        <button
          onClick={() => router.push('/learn')}
          className="mt-4 rounded-lg px-6 py-2 text-sm font-semibold"
          style={{ backgroundColor: '#F59E0B', color: '#E8F0FE' }}
        >
          Continue →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {screens.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentScreen ? 24 : 8,
              backgroundColor: i <= currentScreen ? '#F59E0B' : '#374151',
            }}
          />
        ))}
      </div>

      {/* Screen content */}
      <div key={currentScreen} className="animate-slide-in">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#E8F0FE' }}>
          {screen.title}
        </h2>

        {/* Body text — render markdown-style bold */}
        <div className="text-sm leading-relaxed space-y-3" style={{ color: '#D1D5DB' }}>
          {screen.body.split('\n\n').map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{
              __html: paragraph
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E8F0FE">$1</strong>')
                .replace(/\n/g, '<br/>')
            }} />
          ))}
        </div>

        {/* External action button */}
        {screen.action === 'external_prompt' && screen.action_url && (
          <a
            href={screen.action_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-lg py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: '#F59E0B', color: '#E8F0FE' }}
          >
            {screen.action_label ?? 'Open'} →
          </a>
        )}

        {/* Input fields */}
        {screen.inputs && (
          <div className="mt-6 space-y-5">
            {screen.inputs.map((input) => (
              <div key={input.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E8F0FE' }}>
                  {input.label}
                </label>

                {input.type === 'textarea' && (
                  <textarea
                    value={responses[input.key] ?? ''}
                    onChange={(e) => updateResponse(input.key, e.target.value)}
                    placeholder={input.placeholder}
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      backgroundColor: '#0A1628',
                      color: '#E8F0FE',
                      border: '1px solid #374151',
                    }}
                  />
                )}

                {input.type === 'radio' && input.options && (
                  <div className="space-y-2">
                    {input.options.map((opt) => {
                      const selected = responses[input.key] === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => updateResponse(input.key, opt)}
                          className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all"
                          style={{
                            backgroundColor: selected ? '#F59E0B' : '#122240',
                            color: selected ? '#E8F0FE' : '#8BA3C4',
                            border: selected ? '1px solid #F59E0B' : '1px solid #374151',
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {!isFirst && (
          <button
            onClick={() => setCurrentScreen((s) => s - 1)}
            className="flex-1 rounded-lg py-3 text-sm font-semibold"
            style={{ backgroundColor: '#122240', color: '#8BA3C4', border: '1px solid #374151' }}
          >
            Back
          </button>
        )}
        {isLast ? (
          <button
            onClick={handleComplete}
            disabled={saving || !canProceed()}
            className="flex-1 rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-30"
            style={{ backgroundColor: '#F59E0B', color: '#E8F0FE' }}
          >
            {saving ? 'Saving' : 'Complete'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentScreen((s) => s + 1)}
            disabled={screen.inputs ? !canProceed() : false}
            className="flex-1 rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-30"
            style={{ backgroundColor: '#F59E0B', color: '#E8F0FE' }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
