import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // PKCE flow — exchange code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
    }
  }
  // Legacy token_hash flow
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
      token_hash,
    })
    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
    }
  } else {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
  }

  // Session established — get user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_link', request.url))
  }

  // Check invite status
  const adminClient = createAdminClient()
  const { data: invite } = await adminClient
    .from('invites')
    .select('id, status, expires_at')
    .eq('email', user.email?.toLowerCase() ?? '')
    .single()

  if (invite) {
    const expired = invite.status === 'expired' || new Date(invite.expires_at) < new Date()

    if (expired) {
      if (invite.status !== 'expired') {
        await adminClient
          .from('invites')
          .update({ status: 'expired' })
          .eq('id', invite.id)
      }
      return NextResponse.redirect(new URL('/auth/expired', request.url))
    }

    // Pending invite → new user accepting for the first time
    if (invite.status === 'pending') {
      await adminClient
        .from('invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id)
      return NextResponse.redirect(new URL('/auth/set-password', request.url))
    }
  }

  // Explicit invite type (legacy token_hash flow)
  if (type === 'invite') {
    return NextResponse.redirect(new URL('/auth/set-password', request.url))
  }

  // Existing user — check onboarding
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
