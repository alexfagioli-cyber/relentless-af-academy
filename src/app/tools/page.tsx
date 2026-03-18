import { BottomNav } from '@/components/layout/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface Tool {
  name: string
  description: string
  url: string
  category: string
  pricing: 'Free' | 'Freemium' | 'Paid'
  alexRecommends: boolean
}

const CATEGORY_COLOURS: Record<string, string> = {
  'AI Assistants': '#E8C872',
  Writing: '#EC4899',
  Image: '#E8C872',
  Video: '#8B5CF6',
  Code: '#3B82F6',
  Productivity: '#22C55E',
  Research: '#06B6D4',
}

const PRICING_COLOURS: Record<string, string> = {
  Free: '#22C55E',
  Freemium: '#E8C872',
  Paid: '#8BA3C4',
}

const TOOLS: Tool[] = [
  // AI Assistants
  { name: 'Claude', description: 'Anthropic\'s AI assistant — the one you\'re learning to master here.', url: 'https://claude.ai', category: 'AI Assistants', pricing: 'Freemium', alexRecommends: true },
  { name: 'ChatGPT', description: 'OpenAI\'s conversational AI. Good for comparison and different perspectives.', url: 'https://chat.openai.com', category: 'AI Assistants', pricing: 'Freemium', alexRecommends: false },
  // Writing
  { name: 'Grammarly', description: 'AI-powered writing assistant for grammar, clarity, and tone.', url: 'https://www.grammarly.com', category: 'Writing', pricing: 'Freemium', alexRecommends: false },
  { name: 'Hemingway', description: 'Makes your writing bold and clear. Highlights complex sentences.', url: 'https://hemingwayapp.com', category: 'Writing', pricing: 'Free', alexRecommends: false },
  // Image
  { name: 'DALL-E', description: 'OpenAI\'s image generator. Create images from text descriptions.', url: 'https://openai.com/dall-e-3', category: 'Image', pricing: 'Paid', alexRecommends: false },
  { name: 'Midjourney', description: 'High-quality AI art generation. Best for creative and artistic work.', url: 'https://www.midjourney.com', category: 'Image', pricing: 'Paid', alexRecommends: false },
  // Video
  { name: 'Runway', description: 'AI video generation and editing. Text-to-video, image-to-video.', url: 'https://runwayml.com', category: 'Video', pricing: 'Freemium', alexRecommends: false },
  { name: 'HeyGen', description: 'AI video avatars for presentations, training, and marketing.', url: 'https://www.heygen.com', category: 'Video', pricing: 'Freemium', alexRecommends: false },
  // Code
  { name: 'GitHub Copilot', description: 'AI pair programmer that suggests code in your editor.', url: 'https://github.com/features/copilot', category: 'Code', pricing: 'Paid', alexRecommends: false },
  { name: 'Cursor', description: 'AI-first code editor. Built for working with AI from the ground up.', url: 'https://cursor.sh', category: 'Code', pricing: 'Freemium', alexRecommends: true },
  { name: 'Claude Code', description: 'Anthropic\'s terminal-based AI coding assistant. Specialist-tier material.', url: 'https://docs.anthropic.com/en/docs/claude-code', category: 'Code', pricing: 'Paid', alexRecommends: true },
  // Productivity
  { name: 'Granola', description: 'AI meeting notes that actually work. Records and summarises automatically.', url: 'https://www.granola.ai', category: 'Productivity', pricing: 'Freemium', alexRecommends: true },
  { name: 'Wispr Flow', description: 'AI-powered voice dictation. Speak naturally, get clean text.', url: 'https://www.wispr.ai', category: 'Productivity', pricing: 'Paid', alexRecommends: true },
  { name: 'Notion AI', description: 'AI built into Notion — summarise, draft, brainstorm within your workspace.', url: 'https://www.notion.so/product/ai', category: 'Productivity', pricing: 'Paid', alexRecommends: false },
  // Research
  { name: 'Perplexity', description: 'AI-powered search engine. Get answers with sources, not just links.', url: 'https://www.perplexity.ai', category: 'Research', pricing: 'Freemium', alexRecommends: true },
  { name: 'Consensus', description: 'AI search engine for academic research. Find evidence-based answers.', url: 'https://consensus.app', category: 'Research', pricing: 'Freemium', alexRecommends: false },
]

const categories = [...new Set(TOOLS.map((t) => t.category))]

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#E8F0FE' }}>
          AI Tools Directory
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8BA3C4' }}>
          The best AI tools across every category. Curated, not comprehensive.
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
              {TOOLS.filter((t) => t.category === category).map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg p-4 transition-all"
                  style={{ backgroundColor: '#122240', border: '1px solid #1E3A5F' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: '#E8F0FE' }}>
                          {tool.name}
                        </p>
                        <span
                          className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: PRICING_COLOURS[tool.pricing], backgroundColor: `${PRICING_COLOURS[tool.pricing]}15` }}
                        >
                          {tool.pricing}
                        </span>
                        {tool.alexRecommends && (
                          <span
                            className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                            style={{ color: '#E8C872', backgroundColor: '#E8C87215' }}
                          >
                            Alex recommends
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: '#8BA3C4' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
