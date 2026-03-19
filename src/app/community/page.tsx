import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import { CommunityClient } from './community-client'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('display_name, is_admin')
    .eq('id', user.id)
    .single()

  // Fetch posts with author names
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, learner_id, content, post_type, reactions, is_pinned, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get author names
  const authorIds = [...new Set((posts ?? []).map((p) => p.learner_id))]
  const { data: authors } = await supabase
    .from('learner_profiles')
    .select('id, display_name')
    .in('id', authorIds.length > 0 ? authorIds : ['00000000-0000-0000-0000-000000000000'])

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a.display_name]))

  const postsData = (posts ?? []).map((p) => ({
    id: p.id,
    learnerId: p.learner_id,
    authorName: (authorMap.get(p.learner_id) ?? 'Learner').split(' ')[0],
    content: p.content,
    postType: p.post_type,
    reactions: (p.reactions ?? {}) as Record<string, string[]>,
    isPinned: p.is_pinned,
    createdAt: p.created_at,
  }))

  // Sort: pinned first, then by date
  postsData.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Community</h1>
        <p className="text-sm mb-6" style={{ color: '#D4D4E8' }}>Share, learn, celebrate.</p>

        <CommunityClient
          posts={postsData}
          userId={user.id}
          userName={(profile?.display_name ?? 'Learner').split(' ')[0]}
          isAdmin={profile?.is_admin ?? false}
        />
      </div>
      <BottomNav />
    </div>
  )
}
