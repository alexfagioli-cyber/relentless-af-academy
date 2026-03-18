import { BottomNav } from '@/components/layout/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CopyPromptButton } from './copy-button'

interface Prompt {
  title: string
  template: string
  category: string
}

const CATEGORY_COLOURS: Record<string, string> = {
  Study: '#F59E0B',
  Work: '#DC2626',
  Creative: '#8B5CF6',
  Research: '#3B82F6',
  'Decision-Making': '#22C55E',
  Writing: '#EC4899',
}

const PROMPTS: Prompt[] = [
  // Study
  { category: 'Study', title: 'Explain like I\'m 16', template: 'Explain [topic] to me like I\'m a smart 16-year-old. Use everyday language, real-world examples, and avoid jargon. If there are important technical terms, define them simply.' },
  { category: 'Study', title: 'Create practice questions', template: 'I\'m studying [subject/topic]. Create 10 practice questions that test understanding, not just memorisation. Include a mix of multiple choice, short answer, and one essay question. Provide answers at the end.' },
  { category: 'Study', title: 'Revision summary', template: 'Summarise the key concepts of [topic/chapter] in a revision-friendly format. Use bullet points, bold the most important terms, and include a "common exam mistakes" section at the end.' },
  { category: 'Study', title: 'Compare and contrast', template: 'Compare [concept A] and [concept B]. Create a clear table showing similarities and differences, then explain when you\'d use each one in practice.' },
  // Work
  { category: 'Work', title: 'Meeting prep brief', template: 'I have a meeting about [topic] with [who]. My goals are [goals]. Prepare a brief: key talking points, potential questions they\'ll ask, and 3 outcomes I should push for.' },
  { category: 'Work', title: 'Email draft', template: 'Draft an email to [recipient] about [topic]. Tone: [professional/friendly/direct]. Key points to cover: [points]. Keep it under 200 words.' },
  { category: 'Work', title: 'Summarise this document', template: 'Summarise this document in 3 sections: (1) Key decisions or findings (2) Action items (3) Things to watch. Be direct — no filler.\n\n[paste document]' },
  { category: 'Work', title: 'Weekly update', template: 'Help me write a weekly update. This week I: [list what you did]. Next week I\'m focused on: [priorities]. Blockers: [any issues]. Format it as a concise 3-section update.' },
  // Creative
  { category: 'Creative', title: 'Brainstorm ideas', template: 'I need ideas for [project/topic]. Give me 10 creative options — half should be safe and practical, half should be bold and unexpected. For each, one sentence on why it could work.' },
  { category: 'Creative', title: 'Story starter', template: 'Write the opening 200 words of a short story set in [setting]. The main character is [description]. The tone should be [tone]. End on a hook that makes the reader want to continue.' },
  { category: 'Creative', title: 'Social media post', template: 'Write a [platform] post about [topic]. Tone: [casual/professional/inspiring]. Include a hook in the first line. Under [word count] words. Suggest 3 hashtags.' },
  // Research
  { category: 'Research', title: 'Deep dive briefing', template: 'Give me a comprehensive briefing on [topic]. Structure: (1) What it is (2) Why it matters (3) Current state (4) Key players (5) What to watch. Write for someone intelligent but new to the topic.' },
  { category: 'Research', title: 'Pros and cons analysis', template: 'Analyse the pros and cons of [decision/option]. Be balanced — don\'t lean one way. Include a "bottom line" recommendation at the end with your reasoning.' },
  { category: 'Research', title: 'Find the counterargument', template: 'I believe [your position]. Steelman the strongest counterargument. Then tell me which points I should take seriously and which I can dismiss.' },
  { category: 'Research', title: 'Simplify this paper', template: 'Simplify this academic paper/article for a non-specialist. What\'s the main finding? Why does it matter? What are the limitations?\n\n[paste text]' },
  // Decision-Making
  { category: 'Decision-Making', title: 'Decision framework', template: 'Help me decide between [option A] and [option B]. My priorities are [list priorities]. Score each option against my priorities and give a clear recommendation.' },
  { category: 'Decision-Making', title: 'Pre-mortem', template: 'I\'m about to [decision/action]. Imagine it\'s 6 months from now and it went badly wrong. What went wrong? What should I watch out for? What would I wish I\'d done differently?' },
  { category: 'Decision-Making', title: 'Second opinion', template: 'Here\'s my plan: [describe plan]. Be my advisor. What am I missing? What are the risks I\'m not seeing? Be direct — I want the truth, not reassurance.' },
  // Writing
  { category: 'Writing', title: 'Improve my writing', template: 'Improve this text. Keep my voice and meaning but make it clearer, more concise, and more impactful. Show me the changes and explain why you made them.\n\n[paste text]' },
  { category: 'Writing', title: 'Change the tone', template: 'Rewrite this in a [formal/casual/persuasive/empathetic] tone. Keep the core message but change how it lands.\n\n[paste text]' },
]

const categories = [...new Set(PROMPTS.map((p) => p.category))]

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen pb-20 animate-fade-in" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
          Prompt Library
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          Ready-to-use templates. Copy, fill in the [brackets], paste into Claude.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOURS[category] ?? '#DC2626' }}
              />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CATEGORY_COLOURS[category] ?? '#DC2626' }}>
                {category}
              </h2>
            </div>
            <div className="space-y-2">
              {PROMPTS.filter((p) => p.category === category).map((prompt) => (
                <div
                  key={prompt.title}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>
                        {prompt.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed whitespace-pre-line" style={{ color: '#9CA3AF' }}>
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
      </div>

      <BottomNav />
    </div>
  )
}
