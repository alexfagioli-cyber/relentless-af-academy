'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function PlaygroundInner({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get('prompt') ?? ''
  const [input, setInput] = useState(initialPrompt)
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')

    // Save to history
    const supabase = createClient()
    await supabase.from('playground_history').insert({
      learner_id: userId,
      prompt: text,
    })

    // Simulated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Claude API integration coming soon. For now, open claude.ai to try this prompt.',
        },
      ])
      setSending(false)
    }, 600)
  }

  async function handleCopyAndOpen() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      await navigator.clipboard.writeText(lastUserMsg.content)
    }
    window.open('https://claude.ai', '_blank')
  }

  return (
    <div className="flex flex-col h-[100dvh]" style={{ backgroundColor: '#1A1A2E' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #363654' }}>
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#E8F0FE' }}>AI Playground</h1>
            <p className="text-xs" style={{ color: '#8BA3C4' }}>Practice your prompts</p>
          </div>
          <Link href="/" className="text-xs" style={{ color: '#8BA3C4' }}>
            ← Back
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: '#8BA3C4' }}>
                Type a prompt below to practise. Your prompts are saved so you can see what you&apos;ve tried.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="rounded-xl px-4 py-3 max-w-[85%] text-sm leading-relaxed"
                style={{
                  backgroundColor: msg.role === 'user' ? '#25253D' : '#25253D',
                  border: msg.role === 'user' ? '1px solid #E8C872' : '1px solid #363654',
                  color: '#E8F0FE',
                }}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button
                    onClick={handleCopyAndOpen}
                    className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold"
                    style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                  >
                    Open Claude →
                  </button>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: '#25253D', border: '1px solid #363654', color: '#8BA3C4' }}
              >
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="px-4 py-3" style={{ backgroundColor: '#25253D', borderTop: '1px solid #363654' }}>
        <div className="max-w-lg mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a prompt..."
            rows={1}
            className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
            style={{ backgroundColor: '#1A1A2E', color: '#E8F0FE', border: '1px solid #363654' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="rounded-lg px-4 text-sm font-semibold transition-opacity disabled:opacity-30"
            style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export function PlaygroundClient({ userId }: { userId: string }) {
  return (
    <Suspense>
      <PlaygroundInner userId={userId} />
    </Suspense>
  )
}
