'use client'

import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const RATINGS = [
  { value: 'love', label: 'Love it', emoji: '❤️' },
  { value: 'good', label: 'Good', emoji: '👍' },
  { value: 'needs-work', label: 'Needs work', emoji: '🔧' },
  { value: 'confused', label: 'Confused', emoji: '😕' },
]

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()

  // Skip on auth/admin pages
  const hidden = pathname.startsWith('/auth') || pathname.startsWith('/admin') || pathname === '/welcome' || pathname === '/onboarding'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  if (hidden || !userId) return null

  async function handleSubmit() {
    if (!rating || !userId) return
    const supabase = createClient()
    await supabase.from('general_feedback').insert({
      learner_id: userId,
      page: pathname,
      rating,
      comment: comment.trim() || null,
    })
    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setRating(null)
      setComment('')
    }, 1500)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-40 rounded-full px-3 py-1.5 text-xs font-semibold transition-all shadow-lg"
          style={{ color: '#E8C872', border: '1.5px solid #E8C872', backgroundColor: '#25253D' }}
        >
          Feedback
        </button>
      )}

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-xl p-5 pb-8"
            style={{ backgroundColor: '#25253D', border: '1px solid #363654', borderBottom: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>Thanks for the feedback</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold" style={{ color: '#E8F0FE' }}>
                    How&apos;s the platform so far?
                  </p>
                  <button onClick={() => setOpen(false)} className="text-xs" style={{ color: '#8BA3C4' }}>
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {RATINGS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRating(r.value)}
                      className="rounded-lg py-3 text-center transition-all"
                      style={{
                        backgroundColor: rating === r.value ? '#E8C872' : '#1A1A2E',
                        color: rating === r.value ? '#1A1A2E' : '#8BA3C4',
                        border: `1px solid ${rating === r.value ? '#E8C872' : '#363654'}`,
                      }}
                    >
                      <span className="text-lg block">{r.emoji}</span>
                      <span className="text-[10px] block mt-0.5">{r.label}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Anything specific? (optional)"
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
                  style={{ backgroundColor: '#1A1A2E', color: '#E8F0FE', border: '1px solid #363654' }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!rating}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-30"
                  style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                >
                  Send
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
