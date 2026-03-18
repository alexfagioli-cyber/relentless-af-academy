import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin(): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { ok: false, response: NextResponse.json({ error: 'Not authorised' }, { status: 403 }) }
  }

  return { ok: true }
}

// POST — create a new module
export async function POST(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json()
  const { title, description, tier, track, module_type, platform, external_url, estimated_duration_mins, order_index, content } = body

  if (!title || !tier || !module_type || order_index == null) {
    return NextResponse.json({ error: 'Missing required fields: title, tier, module_type, order_index' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('modules')
    .insert({
      title,
      description: description || null,
      tier,
      track: track ?? 1,
      module_type,
      platform: platform || null,
      external_url: external_url || null,
      estimated_duration_mins: estimated_duration_mins ?? null,
      order_index,
      content: content ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

// PUT — update an existing module
export async function PUT(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json()
  const { id, title, description, tier, track, module_type, platform, external_url, estimated_duration_mins, order_index, content } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing module id' }, { status: 400 })
  }
  if (!title || !tier || !module_type || order_index == null) {
    return NextResponse.json({ error: 'Missing required fields: title, tier, module_type, order_index' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('modules')
    .update({
      title,
      description: description || null,
      tier,
      track: track ?? 1,
      module_type,
      platform: platform || null,
      external_url: external_url || null,
      estimated_duration_mins: estimated_duration_mins ?? null,
      order_index,
      content: content ?? null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
