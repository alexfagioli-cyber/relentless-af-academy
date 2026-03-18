'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Post {
  id: string
  learnerId: string
  authorName: string
  content: string
  postType: string
  reactions: Record<string, string[]>
  isPinned: boolean
  createdAt: string
}

const POST_TYPES = [
  { value: 'share', label: 'Share', colour: '#3B82F6' },
  { value: 'win', label: 'Win', colour: '#22C55E' },
  { value: 'question', label: 'Question', colour: '#E8C872' },
  { value: 'tip', label: 'Tip', colour: '#8B5CF6' },
]

const REACTIONS = [
  { key: 'fire', emoji: '🔥' },
  { key: 'lightbulb', emoji: '💡' },
  { key: 'clap', emoji: '👏' },
]

interface Props {
  posts: Post[]
  userId: string
  userName: string
  isAdmin: boolean
}

export function CommunityClient({ posts: initialPosts, userId, userName, isAdmin }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('share')
  const [posting, setPosting] = useState(false)
  const router = useRouter()

  async function handlePost() {
    if (!content.trim()) return
    setPosting(true)
    const supabase = createClient()
    await supabase.from('community_posts').insert({
      learner_id: userId,
      content: content.trim(),
      post_type: postType,
    })
    setContent('')
    setShowForm(false)
    setPosting(false)
    router.refresh()
  }

  async function handleReaction(postId: string, reactionKey: string, currentReactions: Record<string, string[]>) {
    const supabase = createClient()
    const users = currentReactions[reactionKey] ?? []
    const hasReacted = users.includes(userId)
    const updated = {
      ...currentReactions,
      [reactionKey]: hasReacted
        ? users.filter((id) => id !== userId)
        : [...users, userId],
    }
    await supabase.from('community_posts').update({ reactions: updated }).eq('id', postId)
    router.refresh()
  }

  async function handlePin(postId: string, pinned: boolean) {
    const supabase = createClient()
    await supabase.from('community_posts').update({ is_pinned: !pinned }).eq('id', postId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* New post button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg py-3 text-sm font-semibold"
          style={{ backgroundColor: '#E8C872', color: '#1E293B' }}
        >
          New Post
        </button>
      ) : (
        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C872' }}>
          <div className="flex gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setPostType(t.value)}
                className="rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: postType === t.value ? t.colour : '#F8FAFC',
                  color: postType === t.value ? '#1E293B' : '#64748B',
                  border: `1px solid ${postType === t.value ? t.colour : '#E2E8F0'}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
            style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg py-2 text-sm font-semibold"
              style={{ backgroundColor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="flex-1 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ backgroundColor: '#E8C872', color: '#1E293B' }}
            >
              {posting ? 'Posting' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {initialPosts.map((post) => {
        const typeInfo = POST_TYPES.find((t) => t.value === post.postType)
        return (
          <div
            key={post.id}
            className="rounded-lg p-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: post.isPinned ? '1px solid #E8C872' : '1px solid #E2E8F0',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              {post.isPinned && <span className="text-xs" style={{ color: '#E8C872' }}>📌</span>}
              <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                {post.authorName}
              </span>
              {typeInfo && (
                <span
                  className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: typeInfo.colour, backgroundColor: `${typeInfo.colour}15` }}
                >
                  {typeInfo.label}
                </span>
              )}
              <span className="ml-auto text-[10px]" style={{ color: '#6B7280' }}>
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#D1D5DB' }}>
              {post.content}
            </p>

            {/* Reactions */}
            <div className="flex items-center gap-2 mt-3">
              {REACTIONS.map((r) => {
                const users = post.reactions[r.key] ?? []
                const count = users.length
                const reacted = users.includes(userId)
                return (
                  <button
                    key={r.key}
                    onClick={() => handleReaction(post.id, r.key, post.reactions)}
                    className="rounded-md px-2 py-1 text-xs flex items-center gap-1 transition-all"
                    style={{
                      backgroundColor: reacted ? '#E2E8F0' : 'transparent',
                      border: `1px solid ${reacted ? '#64748B' : '#E2E8F0'}`,
                      color: '#64748B',
                    }}
                  >
                    <span>{r.emoji}</span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                )
              })}
              {isAdmin && (
                <button
                  onClick={() => handlePin(post.id, post.isPinned)}
                  className="ml-auto text-[10px]"
                  style={{ color: '#6B7280' }}
                >
                  {post.isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}
            </div>
          </div>
        )
      })}

      {initialPosts.length === 0 && (
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p className="text-sm" style={{ color: '#64748B' }}>
            No posts yet. Be the first to share something.
          </p>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1d'
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
