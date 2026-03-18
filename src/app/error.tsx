'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A1628' }}>
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#E8F0FE' }}>
          Something&apos;s not right
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8BA3C4' }}>
          Give it a moment and try again.
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: '#DC2626', color: '#E8F0FE' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
