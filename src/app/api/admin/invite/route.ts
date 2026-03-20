import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify caller is authenticated and admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse request
  let body: { email: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email } = body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 254) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Send invite via admin client (service_role)
  const adminClient = createAdminClient()

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${request.nextUrl.origin}/auth/confirm`,
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Pre-create minimal profile so middleware doesn't break if onboarding fails
  if (inviteData?.user) {
    const { error: profileError } = await adminClient
      .from('learner_profiles')
      .upsert({
        id: inviteData.user.id,
        display_name: email.split('@')[0],
        onboarding_complete: false,
      }, { onConflict: 'id' })

    if (profileError) {
      // Non-fatal — onboarding upsert is the fallback
      console.error('Pre-create profile failed:', profileError.message)
    }
  }

  // Create invite row (only after successful invite send)
  const { error: rowError } = await adminClient
    .from('invites')
    .insert({
      email: email.toLowerCase(),
      invited_by: user.id,
      status: 'pending',
    })

  if (rowError) {
    // Invite was sent but row creation failed — log but don't fail the request
    console.error('Failed to create invite row:', rowError.message)
  }

  return NextResponse.json({ success: true, email })
}
