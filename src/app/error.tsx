'use client'

import { useEffect } from 'react'
import { logPlatformError } from '@/lib/error-logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logPlatformError({
      errorType: 'client_error',
      message: error.message,
      stack: error.stack,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'transparent' }}>
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
          Something&apos;s not right
        </h1>
        <p className="text-sm mb-6" style={{ color: '#D4D4E8' }}>
          Give it a moment and try again.
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
