'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#111827' }}>
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#F9FAFB' }}>
          Service temporarily unavailable
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          Something went wrong. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
