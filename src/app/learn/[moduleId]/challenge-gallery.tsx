import { createClient } from '@/lib/supabase/server'

interface Props {
  moduleId: string
}

export async function ChallengeGallery({ moduleId }: Props) {
  const supabase = await createClient()

  const { data: responses } = await supabase
    .from('challenge_responses')
    .select('learner_id, responses, share_anonymous')
    .eq('module_id', moduleId)
    .eq('shared', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!responses || responses.length === 0) return null

  // Get author names
  const nonAnonIds = responses.filter((r) => !r.share_anonymous).map((r) => r.learner_id)
  const { data: authors } = await supabase
    .from('learner_profiles')
    .select('id, display_name')
    .in('id', nonAnonIds.length > 0 ? nonAnonIds : ['00000000-0000-0000-0000-000000000000'])

  const nameMap = new Map((authors ?? []).map((a) => [a.id, (a.display_name ?? 'Learner').split(' ')[0]]))

  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: '#64748B' }}>
        How others approached this
      </p>
      <div className="space-y-2">
        {responses.map((r, i) => {
          const name = r.share_anonymous ? 'Anonymous' : (nameMap.get(r.learner_id) ?? 'Learner')
          const text = (r.responses as Record<string, string>)?.reflection ?? ''
          if (!text) return null
          return (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#1E293B' }}>{name}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                {text.length > 200 ? text.slice(0, 200) + '...' : text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
