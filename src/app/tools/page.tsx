import { BottomNav } from '@/components/layout/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const CATEGORY_COLOURS: Record<string, string> = {
  'AI Assistants': '#D4A31E',
  Writing: '#EC4899',
  Image: '#D4A31E',
  Video: '#8B5CF6',
  Code: '#3B82F6',
  Productivity: '#22C55E',
  Research: '#06B6D4',
}

const PRICING_COLOURS: Record<string, string> = {
  free: '#22C55E',
  freemium: '#D4A31E',
  paid: '#64748B',
}

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tools } = await supabase
    .from('ai_tools')
    .select('id, name, description, url, category, pricing, alex_recommends')
    .order('order_index', { ascending: true })

  const categories = [...new Set((tools ?? []).map((t) => t.category))]

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
          AI Tools Directory
        </h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          The best AI tools across every category. Curated, not comprehensive.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOURS[category] ?? '#D4A31E' }}
              />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CATEGORY_COLOURS[category] ?? '#D4A31E' }}>
                {category}
              </h2>
            </div>
            <div className="space-y-2">
              {(tools ?? []).filter((t) => t.category === category).map((tool) => (
                <a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg p-4 transition-all"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                          {tool.name}
                        </p>
                        {tool.pricing && (
                          <span
                            className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                            style={{ color: PRICING_COLOURS[tool.pricing] ?? '#64748B', backgroundColor: `${PRICING_COLOURS[tool.pricing] ?? '#64748B'}15` }}
                          >
                            {tool.pricing}
                          </span>
                        )}
                        {tool.alex_recommends && (
                          <span
                            className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                            style={{ color: '#D4A31E', backgroundColor: '#D4A31E15' }}
                          >
                            Alex recommends
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: '#64748B' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {(!tools || tools.length === 0) && (
          <p className="text-sm text-center py-8" style={{ color: '#64748B' }}>Tools coming soon.</p>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
