'use client'

import { useState } from 'react'

interface PlatformError {
  id: string
  error_type: string | null
  message: string | null
  stack: string | null
  page: string | null
  created_at: string
}

export function ErrorsList({ errors }: { errors: PlatformError[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (errors.length === 0) {
    return (
      <p className="text-sm" style={{ color: '#8BA3C4' }}>
        No errors recorded.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {errors.map((err) => {
        const isExpanded = expandedId === err.id
        const truncatedMessage =
          err.message && err.message.length > 100
            ? err.message.slice(0, 100) + '...'
            : err.message

        return (
          <div
            key={err.id}
            className="rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: '#25253D',
              border: '1px solid #363654',
            }}
            onClick={() => setExpandedId(isExpanded ? null : err.id)}
          >
            {/* Summary row */}
            <div className="px-4 py-3 flex items-start gap-3">
              <span
                className="text-xs font-mono font-medium shrink-0 mt-0.5 px-2 py-0.5 rounded"
                style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                {err.error_type ?? 'unknown'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: '#E8F0FE' }}>
                  {truncatedMessage ?? 'No message'}
                </p>
                <div className="flex gap-3 mt-1">
                  {err.page && (
                    <span className="text-xs" style={{ color: '#8BA3C4' }}>
                      {err.page}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: '#8BA3C4' }}>
                    {new Date(err.created_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div
                className="px-4 pb-4"
                style={{ borderTop: '1px solid #363654' }}
              >
                <div className="pt-3">
                  <p className="text-xs font-medium mb-1" style={{ color: '#8BA3C4' }}>
                    Full message
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words" style={{ color: '#E8F0FE' }}>
                    {err.message ?? 'No message'}
                  </p>
                </div>
                {err.stack && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1" style={{ color: '#8BA3C4' }}>
                      Stack trace
                    </p>
                    <pre
                      className="text-xs whitespace-pre-wrap break-words overflow-x-auto p-3 rounded"
                      style={{
                        color: '#8BA3C4',
                        backgroundColor: 'rgba(54, 54, 84, 0.5)',
                      }}
                    >
                      {err.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
