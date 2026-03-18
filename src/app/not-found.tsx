import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#111827' }}>
      <div className="text-center">
        <p className="text-6xl font-bold mb-4" style={{ color: '#DC2626' }}>404</p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#F9FAFB' }}>
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
