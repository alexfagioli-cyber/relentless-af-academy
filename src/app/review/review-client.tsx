'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Review {
  id: string
  moduleId: string
  moduleTitle: string
  moduleType: string
  reviewType: string
  dueDate: string
}

const TYPE_LABELS: Record<string, string> = {
  '1_week': '1 week review',
  '1_month': '1 month review',
  '3_month': '3 month review',
}

const REFLECTION_PROMPTS = [
  'What was the most important thing you learned from this module?',
  'How have you applied what you learned since completing it?',
  'What would you do differently now that you know more?',
]

export function ReviewClient({ reviews, userId }: { reviews: Review[]; userId: string }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [response, setResponse] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleComplete(reviewId: string) {
    setSaving(true)
    const supabase = createClient()

    await supabase
      .from('review_schedule')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', reviewId)

    await supabase.from('learning_events').insert({
      learner_id: userId,
      verb: 'completed',
      object_type: 'module',
      object_id: reviews[activeIdx ?? 0].moduleId,
      context: { type: 'review', review_type: reviews[activeIdx ?? 0].reviewType },
    })

    setActiveIdx(null)
    setResponse('')
    setSaving(false)
    router.refresh()
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
        <p className="text-sm" style={{ color: '#22C55E' }}>All caught up — no reviews due.</p>
      </div>
    )
  }

  if (activeIdx !== null) {
    const review = reviews[activeIdx]
    const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="rounded-lg p-4" style={{ backgroundColor: '#25253D', border: '1px solid #E8C872' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: '#E8C872' }}>
            {TYPE_LABELS[review.reviewType] ?? 'Review'}
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: '#FFFFFF' }}>
            {review.moduleTitle}
          </p>
        </div>

        <p className="text-sm" style={{ color: '#FFFFFF' }}>{prompt}</p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Your reflection..."
          rows={4}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
          style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setActiveIdx(null)}
            className="flex-1 rounded-lg py-2.5 text-sm"
            style={{ backgroundColor: '#1A1A2E', color: '#D4D4E8', border: '1px solid #363654' }}
          >
            Back
          </button>
          <button
            onClick={() => handleComplete(review.id)}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-30"
            style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
          >
            {saving ? 'Saving' : 'Done'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reviews.map((review, i) => (
        <button
          key={review.id}
          onClick={() => setActiveIdx(i)}
          className="w-full text-left rounded-lg p-4 transition-all"
          style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{review.moduleTitle}</p>
              <p className="text-xs mt-0.5" style={{ color: '#D4D4E8' }}>
                {TYPE_LABELS[review.reviewType] ?? 'Review'} · due {review.dueDate}
              </p>
            </div>
            <span className="text-sm" style={{ color: '#E8C872' }}>→</span>
          </div>
        </button>
      ))}
    </div>
  )
}
