'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/welcome')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0F172A' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>
            Welcome to the Academy
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#9CA3AF' }}>
            Set your password to get started
          </p>
        </div>

        {error && (
          <div className="rounded-md p-3 text-sm" style={{ backgroundColor: '#1E293B', color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#9CA3AF' }}>
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
                backgroundColor: '#1E293B',
                color: '#F9FAFB',
                borderColor: '#374151',
                border: '1px solid #374151',
              }}
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#9CA3AF' }}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: '#1E293B',
                color: '#F9FAFB',
                borderColor: '#374151',
                border: '1px solid #374151',
              }}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
          >
            {loading ? 'Setting password' : 'Set Your Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
