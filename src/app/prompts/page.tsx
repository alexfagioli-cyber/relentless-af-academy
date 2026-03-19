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
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          Prompt Library
        </h1>
        <p className="text-sm mb-6" style={{ color: '#D4D4E8' }}>
          Ready-to-use templates. Copy, fill in the [brackets], paste into Claude.
        </p>

        {/* Anatomy of a Good Prompt */}
        <div className="rounded-lg p-5 mb-8" style={{ backgroundColor: '#25253D', border: '1px solid #E8C872' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#E8C872' }}>
            Anatomy of a Good Prompt
          </h2>
          <p className="text-sm mb-4" style={{ color: '#D4D4E8' }}>
            Every great prompt has the same building blocks. Learn these and you can write your own — no templates needed.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Role', colour: '#E8C872', desc: 'Tell the AI who to be', example: '"You are a senior marketing strategist with 15 years in B2B SaaS..."' },
              { label: 'Context', colour: '#3B82F6', desc: 'Give it what it needs to know', example: '"I run a 20-person consulting firm. We\'re pitching a new client next week..."' },
              { label: 'Task', colour: '#22C55E', desc: 'Be specific about what you want', example: '"Write 3 different opening paragraphs for the proposal, each with a different angle..."' },
              { label: 'Constraints', colour: '#8B5CF6', desc: 'Set the boundaries', example: '"Under 200 words each. Professional tone. No jargon. British English."' },
              { label: 'Format', colour: '#EC4899', desc: 'Tell it how to deliver', example: '"Numbered list with a headline for each option and a one-line rationale."' },
            ].map((block) => (
              <div key={block.label} className="rounded-md p-3" style={{ backgroundColor: '#1A1A2E', border: `1px solid ${block.colour}30` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: block.colour }} />
                  <span className="text-sm font-semibold" style={{ color: block.colour }}>{block.label}</span>
                  <span className="text-xs" style={{ color: '#8BA3C4' }}>— {block.desc}</span>
                </div>
                <p className="text-xs italic ml-4" style={{ color: '#D4D4E8' }}>{block.example}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: '#8BA3C4' }}>
            You don&apos;t need all five every time — but the more context you give, the better the output. The templates below use these building blocks. Look for the pattern.
          </p>
        </div>

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
                  style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                        {prompt.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed whitespace-pre-line" style={{ color: '#D4D4E8' }}>
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
          <p className="text-sm text-center py-8" style={{ color: '#D4D4E8' }}>Prompts coming soon.</p>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
