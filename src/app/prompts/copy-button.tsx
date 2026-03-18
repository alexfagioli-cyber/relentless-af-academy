'use client'

import { useState } from 'react'

export function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all"
      style={{
        backgroundColor: copied ? '#14532D' : '#0F172A',
        color: copied ? '#22C55E' : '#9CA3AF',
        border: `1px solid ${copied ? '#22C55E' : '#374151'}`,
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
