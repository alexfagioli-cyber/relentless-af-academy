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

export async function GET() {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const { data: prompts, error } = await adminClient
    .from('prompt_templates')
    .select('id, title, category, template, description, order_index, created_at')
    .order('order_index', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prompts: prompts ?? [] })
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { title: string; category: string; template: string; description?: string; order_index?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { title, category, template, description, order_index } = body

  if (!title?.trim() || !category?.trim() || !template?.trim()) {
    return NextResponse.json({ error: 'Title, category, and template are required' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('prompt_templates')
    .insert({
      title: title.trim(),
      category: category.trim(),
      template: template.trim(),
      description: description?.trim() || null,
      order_index: order_index ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prompt: data })
}

export async function PUT(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { id: string; title: string; category: string; template: string; description?: string; order_index?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, title, category, template, description, order_index } = body

  if (!id) {
    return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 })
  }

  if (!title?.trim() || !category?.trim() || !template?.trim()) {
    return NextResponse.json({ error: 'Title, category, and template are required' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('prompt_templates')
    .update({
      title: title.trim(),
      category: category.trim(),
      template: template.trim(),
      description: description?.trim() || null,
      order_index: order_index ?? 0,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prompt: data })
}
