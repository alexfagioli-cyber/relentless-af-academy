'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { CelebrationKey, CelebrationMessage } from '@/lib/celebrations'
import { CELEBRATIONS } from '@/lib/celebrations'

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

type CelebrationContextType = {
  celebrate: (key: CelebrationKey) => void
}

const CelebrationContext = createContext<CelebrationContextType>({
  celebrate: () => {},
})

export const useCelebration = () => useContext(CelebrationContext)

/* ------------------------------------------------------------------ */
/*  Toast component                                                    */
/* ------------------------------------------------------------------ */

function Toast({
  celebration,
  onDismiss,
}: {
  celebration: CelebrationMessage
  onDismiss: () => void
}) {
  return (
    <button
      onClick={onDismiss}
      className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-lg border-l-4 px-4 py-3 shadow-lg cursor-pointer text-left"
      style={{
        backgroundColor: '#FFFFFF',
        borderLeftColor: '#E8C872',
        animation: 'toastSlideIn 0.35s ease-out',
      }}
    >
      <p className="text-sm font-semibold text-white">{celebration.title}</p>
      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
        {celebration.message}
      </p>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

type QueueItem = {
  id: number
  message: CelebrationMessage
}

let nextId = 0

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([])

  const dismiss = useCallback((id: number) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const celebrate = useCallback(
    (key: CelebrationKey) => {
      const message = CELEBRATIONS[key]
      if (!message) return
      const id = nextId++
      setQueue((prev) => [...prev, { id, message }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      {/* Toast container — fixed to top of viewport */}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {queue.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast
              celebration={item.message}
              onDismiss={() => dismiss(item.id)}
            />
          </div>
        ))}
      </div>
    </CelebrationContext.Provider>
  )
}
