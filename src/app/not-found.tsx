import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'transparent' }}>
      <div className="text-center">
        <p className="text-6xl font-bold mb-4" style={{ color: '#E8C872' }}>404</p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#E8F0FE' }}>
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8BA3C4' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: '#E8C872', color: '#E8F0FE' }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
