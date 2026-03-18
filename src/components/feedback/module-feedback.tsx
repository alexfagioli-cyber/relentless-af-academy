'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface Props {
  moduleId: string
  userId: string
}

const RATINGS = [
  { value: 'useful', label: 'Useful', icon: '👍' },
  { value: 'too_easy', label: 'Too Easy', icon: '😴' },
  { value: 'too_hard', label: 'Too Hard', icon: '😤' },
  { value: 'confusing', label: 'Confusing', icon: '😕' },
] as const

export function ModuleFeedback({ moduleId, userId }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load existing feedback on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('module_feedback')
        .select('rating, comment')
        .eq('learner_id', userId)
        .eq('module_id', moduleId)
        .single()

      if (data) {
        setSelected(data.rating)
        setComment(data.comment ?? '')
        setSaved(true)
        if (data.comment) setShowComment(true)
      }
    }
    load()
  }, [moduleId, userId])

  async function handleSelect(rating: string) {
    setSelected(rating)
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('module_feedback')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        rating,
        comment: comment || null,
      }, { onConflict: 'learner_id,module_id' })

    setSaving(false)
    setSaved(true)
  }

  async function handleCommentSave() {
    if (!selected) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('module_feedback')
      .upsert({
        learner_id: userId,
        module_id: moduleId,
        rating: selected,
        comment: comment || null,
      }, { onConflict: 'learner_id,module_id' })

    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="mt-6 pt-6" style={{ borderTop: '1px solid #374151' }}>
      <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>
        How was this module?
      </p>

      <div className="flex gap-2">
        {RATINGS.map((r) => (
          <button
            key={r.value}
            onClick={() => handleSelect(r.value)}
            disabled={saving}
            className="flex-1 rounded-lg py-2 text-center text-xs transition-all"
            style={{
              backgroundColor: selected === r.value ? '#E8C872' : '#25253D',
              color: selected === r.value ? '#E8F0FE' : '#8BA3C4',
              border: selected === r.value ? '1px solid #E8C872' : '1px solid #374151',
            }}
          >
            <span className="block text-base mb-0.5">{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      {selected && !showComment && (
        <button
          onClick={() => setShowComment(true)}
          className="mt-2 text-xs"
          style={{ color: '#6B7280' }}
        >
          Add a comment...
        </button>
      )}

      {showComment && (
        <div className="mt-3 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional — anything else?"
            rows={2}
            className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
            style={{
              backgroundColor: '#1A1A2E',
              color: '#E8F0FE',
              border: '1px solid #374151',
            }}
          />
          <button
            onClick={handleCommentSave}
            disabled={saving}
            className="rounded-md px-4 py-2 text-xs font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#25253D', color: '#8BA3C4', border: '1px solid #374151' }}
          >
            {saving ? 'Saving' : 'Save comment'}
          </button>
        </div>
      )}

      {saved && !saving && (
        <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>
          Thanks for the feedback.
        </p>
      )}
    </div>
  )
}
