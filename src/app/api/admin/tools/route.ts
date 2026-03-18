import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null

  return user
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: {
    name: string
    description?: string | null
    url?: string | null
    category?: string | null
    pricing?: string | null
    alex_recommends?: boolean
    order_index?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (body.pricing && !['free', 'freemium', 'paid'].includes(body.pricing)) {
    return NextResponse.json({ error: 'Invalid pricing value' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('ai_tools')
    .insert({
      name: body.name.trim(),
      description: body.description ?? null,
      url: body.url ?? null,
      category: body.category ?? null,
      pricing: body.pricing ?? 'free',
      alex_recommends: body.alex_recommends ?? false,
      order_index: body.order_index ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tool: data })
}

export async function PUT(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: {
    id: string
    name: string
    description?: string | null
    url?: string | null
    category?: string | null
    pricing?: string | null
    alex_recommends?: boolean
    order_index?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (body.pricing && !['free', 'freemium', 'paid'].includes(body.pricing)) {
    return NextResponse.json({ error: 'Invalid pricing value' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('ai_tools')
    .update({
      name: body.name.trim(),
      description: body.description ?? null,
      url: body.url ?? null,
      category: body.category ?? null,
      pricing: body.pricing ?? 'free',
      alex_recommends: body.alex_recommends ?? false,
      order_index: body.order_index ?? 0,
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tool: data })
}
