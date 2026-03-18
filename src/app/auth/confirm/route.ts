import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check invite expiry
        const adminClient = createAdminClient()
        const { data: invite } = await adminClient
          .from('invites')
          .select('id, status, expires_at')
          .eq('email', user.email?.toLowerCase() ?? '')
          .single()

        if (invite) {
          const expired = invite.status === 'expired' || new Date(invite.expires_at) < new Date()

          if (expired) {
            // Update invite status to expired if not already
            if (invite.status !== 'expired') {
              await adminClient
                .from('invites')
                .update({ status: 'expired' })
                .eq('id', invite.id)
            }
            return NextResponse.redirect(new URL('/auth/expired', request.url))
          }

          // Mark invite as accepted
          await adminClient
            .from('invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id)
        }

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
