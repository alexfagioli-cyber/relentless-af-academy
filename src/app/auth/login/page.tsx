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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#E8F0FE' }}>
          RelentlessAF Academy
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#8BA3C4' }}>
          Sign in to continue your journey
        </p>
        <p className="mt-4 text-sm italic" style={{ color: '#8BA3C4' }}>
          {getLoginQuote()}
        </p>
      </div>

      {(urlError || error) && (
        <div className="rounded-md p-3 text-sm" style={{ backgroundColor: '#122240', color: '#F59E0B' }}>
          {urlError === 'invalid_link' ? 'Invalid or expired link. Please try again.' : error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#8BA3C4' }}>
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
              backgroundColor: '#122240',
              color: '#E8F0FE',
              borderColor: '#374151',
              border: '1px solid #374151',
            }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#8BA3C4' }}>
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
              backgroundColor: '#122240',
              color: '#E8F0FE',
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
          style={{ backgroundColor: '#F59E0B', color: '#E8F0FE' }}
        >
          {loading ? 'Signing in' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A1628' }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
