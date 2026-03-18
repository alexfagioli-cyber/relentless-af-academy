import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
      token_hash,
    })

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('learner_profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single()

        // New invited user — send to set-password
        if (type === 'invite') {
          return NextResponse.redirect(new URL('/auth/set-password', request.url))
        }

        // Existing user without onboarding — send to onboarding
        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If verification fails, redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
}
