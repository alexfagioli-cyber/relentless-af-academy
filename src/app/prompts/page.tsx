import { BottomNav } from '@/components/layout/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CopyPromptButton } from './copy-button'

const CATEGORY_COLOURS: Record<string, string> = {
  Study: '#E8C872',
  Work: '#E8C872',
  Creative: '#8B5CF6',
  Research: '#3B82F6',
  'Decision-Making': '#22C55E',
  Writing: '#EC4899',
}

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: prompts } = await supabase
    .from('prompt_templates')
    .select('id, title, category, template')
    .order('order_index', { ascending: true })

  const categories = [...new Set((prompts ?? []).map((p) => p.category))]

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
          Prompt Library
        </h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          Ready-to-use templates. Copy, fill in the [brackets], paste into Claude.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOURS[category] ?? '#E8C872' }}
              />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CATEGORY_COLOURS[category] ?? '#E8C872' }}>
                {category}
              </h2>
            </div>
            <div className="space-y-2">
              {(prompts ?? []).filter((p) => p.category === category).map((prompt) => (
                <div
                  key={prompt.id}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                        {prompt.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed whitespace-pre-line" style={{ color: '#64748B' }}>
                        {prompt.template}
                      </p>
                    </div>
                    <CopyPromptButton text={prompt.template} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!prompts || prompts.length === 0) && (
          <p className="text-sm text-center py-8" style={{ color: '#64748B' }}>Prompts coming soon.</p>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
