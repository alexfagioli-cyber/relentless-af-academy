'use client'

import { createClient } from '@/lib/supabase/client'
import { getLoginQuote } from '@/lib/login-quotes'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlError = searchParams.get('error')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Generate unique session ID — allows up to 2 concurrent sessions (mobile + desktop)
    if (data.user) {
      const sessionId = crypto.randomUUID()
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('active_session_ids')
        .eq('id', data.user.id)
        .single()
      const existing: string[] = profile?.active_session_ids ?? []
      const updated = [...existing, sessionId].slice(-2) // keep last 2 only
      await supabase
        .from('learner_profiles')
        .update({ active_session_ids: updated })
        .eq('id', data.user.id)
      document.cookie = `academy_session_id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm space-y-8 relative z-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
          RelentlessAF Academy
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#D4D4E8' }}>
          Sign in to continue your journey
        </p>
        <p className="mt-4 text-sm italic" style={{ color: '#D4D4E8' }}>
          {getLoginQuote()}
        </p>
      </div>

      {searchParams.get('invited') === 'true' && (
        <div className="rounded-md p-3 text-sm" style={{ backgroundColor: '#14532D', color: '#22C55E' }}>
          You&apos;re in. Your temporary password was sent with your invite — sign in below to get started.
        </div>
      )}

      {(urlError || error) && !searchParams.get('invited') && (
        <div className="rounded-md p-3 text-sm" style={{ backgroundColor: '#25253D', color: '#E8C872' }}>
          {urlError === 'invalid_link' ? 'Invalid or expired link. Please try again.'
            : urlError === 'session_replaced' ? 'You were signed out because your account was signed in on another device.'
            : error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#D4D4E8' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              backgroundColor: '#25253D',
              color: '#FFFFFF',
              borderColor: '#374151',
              border: '1px solid #374151',
            }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#D4D4E8' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              backgroundColor: '#25253D',
              color: '#FFFFFF',
              borderColor: '#374151',
              border: '1px solid #374151',
            }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#E8C872', color: '#FFFFFF' }}
        >
          {loading ? 'Signing in' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 vignette relative" style={{ backgroundColor: 'transparent' }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
