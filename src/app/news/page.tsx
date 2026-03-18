import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'

const CATEGORY_LABELS: Record<string, { label: string; colour: string }> = {
  feature: { label: 'Feature', colour: '#E8C872' },
  tip: { label: 'Tip', colour: '#22C55E' },
  'use-case': { label: 'Use Case', colour: '#E8C872' },
  news: { label: 'News', colour: '#8B5CF6' },
}

export default async function NewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: items } = await supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          AI News &amp; Ideas
        </h1>
        <p className="text-sm mb-6" style={{ color: '#D4D4E8' }}>
          What&apos;s happening in AI — and how it applies to you.
        </p>

        <div className="space-y-3">
          {(items ?? []).map((item) => {
            const cat = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.news
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg p-4 transition-all"
                style={{ backgroundColor: '#25253D', borderLeft: `3px solid ${cat.colour}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${cat.colour}20`, color: cat.colour }}
                  >
                    {cat.label}
                  </span>
                  {item.published_at && (
                    <span className="text-[10px]" style={{ color: '#6B7280' }}>
                      {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: '#D4D4E8' }}>
                    {item.description}
                  </p>
                )}
              </a>
            )
          })}
        </div>

        {(!items || items.length === 0) && (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
            <p className="text-sm" style={{ color: '#D4D4E8' }}>
              Nothing here yet. Check back soon.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
