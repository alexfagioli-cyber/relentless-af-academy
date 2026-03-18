'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full rounded-lg py-3 text-sm font-semibold text-center transition-opacity disabled:opacity-50"
      style={{ backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0' }}
    >
      {loading ? 'Signing out' : 'Sign Out'}
    </button>
  )
}
