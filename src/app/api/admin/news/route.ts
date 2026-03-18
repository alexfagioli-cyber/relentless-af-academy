import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: items, error } = await admin
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, url, category, published_at } = body

  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('news_items')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      url: url.trim(),
      category: category || 'news',
      published_at: published_at ? new Date(published_at).toISOString() : new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function PUT(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...fields } = body

  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
  }

  // Build update payload — only include fields that were sent
  const update: Record<string, unknown> = {}
  if (fields.title !== undefined) update.title = fields.title.trim()
  if (fields.description !== undefined) update.description = fields.description?.trim() || null
  if (fields.url !== undefined) update.url = fields.url.trim()
  if (fields.category !== undefined) update.category = fields.category
  if (fields.published_at !== undefined) {
    update.published_at = new Date(fields.published_at).toISOString()
  }
  if (fields.hidden !== undefined) update.hidden = fields.hidden

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('news_items')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}
