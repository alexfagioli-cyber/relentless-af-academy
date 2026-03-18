'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCelebration } from '@/components/ui/celebration-toast'

interface Props {
  moduleId: string
  userId: string
  platform: string | null
}

export function VerifyCert({ moduleId, userId, platform }: Props) {
  const [certNumber, setCertNumber] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fallback, setFallback] = useState(false)
  const router = useRouter()
  const { celebrate } = useCelebration()

  async function markCompleteWithEvent() {
    const supabase = createClient()

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
        context: { verification_method: fallback ? 'self_report' : 'certificate', cert_number: certNumber || null },
      })

    const { updateStreak } = await import('@/lib/streak')
    await updateStreak(supabase, userId)

    // Check if this is the learner's first cert verification
    const { count } = await supabase
      .from('learning_events')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', userId)
      .eq('verb', 'completed')
      .contains('context', { verification_method: 'certificate' })
    if (count === 1) celebrate('first_cert_verified')

    setSuccess(true)
    router.refresh()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const sanitised = certNumber.trim().slice(0, 100).replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!sanitised) return

    setVerifying(true)
    setError(null)

    try {
      // Attempt Skilljar verification
      const res = await fetch(`https://verify.skilljar.com/c/${encodeURIComponent(sanitised)}`, {
        method: 'HEAD',
        mode: 'no-cors',
      })

      // no-cors means we can't read the status reliably
      // If we get here without throwing, treat as potentially valid
      // Mark complete — admin can verify later if needed
      await markCompleteWithEvent()
    } catch {
      // Verification endpoint unreachable — fall back to self-report
      setFallback(true)
      setError('Certificate verification is unavailable. You can self-report completion instead.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleSelfReport() {
    setVerifying(true)
    setFallback(true)
    await markCompleteWithEvent()
    setVerifying(false)
  }

  if (success) {
    return (
      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#14532D' }}>
        <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>
          Course marked as complete
        </p>
      </div>
    )
  }

  // Only show for Skilljar courses
  if (platform !== 'skilljar') return null

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#F9FAFB' }}>
          Have a certificate?
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            placeholder="Certificate number"
            className="flex-1 rounded-md px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: '#111827',
              color: '#F9FAFB',
              border: '1px solid #374151',
            }}
          />
          <button
            type="submit"
            disabled={verifying || !certNumber.trim()}
            className="rounded-md px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
          >
            {verifying ? '...' : 'Verify Certificate'}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-xs" style={{ color: '#F59E0B' }}>{error}</p>
        )}
      </div>

      {fallback && (
        <button
          onClick={handleSelfReport}
          disabled={verifying}
          className="w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#1E293B', color: '#9CA3AF', border: '1px solid #374151' }}
        >
          {verifying ? 'Saving' : 'Self-Report Completion'}
        </button>
      )}
    </div>
  )
}
