'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Tool {
  id: string
  name: string
  description: string | null
  url: string | null
  category: string | null
  pricing: string | null
  alex_recommends: boolean
  order_index: number
  created_at: string
}

type FormData = {
  name: string
  description: string
  url: string
  category: string
  pricing: string
  alex_recommends: boolean
  order_index: string
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  url: '',
  category: '',
  pricing: 'free',
  alex_recommends: false,
  order_index: '0',
}

const PRICING_OPTIONS = ['free', 'freemium', 'paid']

function pricingBadgeColour(pricing: string | null): string {
  switch (pricing) {
    case 'free': return '#22C55E'
    case 'freemium': return '#E8C872'
    case 'paid': return '#EF4444'
    default: return '#6B7280'
  }
}

export function ToolsManager({ tools }: { tools: Tool[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError(null)
  }

  function openEdit(tool: Tool) {
    setEditingId(tool.id)
    setForm({
      name: tool.name,
      description: tool.description ?? '',
      url: tool.url ?? '',
      category: tool.category ?? '',
      pricing: tool.pricing ?? 'free',
      alex_recommends: tool.alex_recommends,
      order_index: String(tool.order_index),
    })
    setShowForm(true)
    setError(null)
  }

  function cancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      url: form.url.trim() || null,
      category: form.category.trim() || null,
      pricing: form.pricing,
      alex_recommends: form.alex_recommends,
      order_index: parseInt(form.order_index, 10) || 0,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...payload } : payload

      const res = await fetch('/api/admin/tools', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save tool')
      }

      cancel()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#6B7280' }}>
          {tools.length} tool{tools.length !== 1 ? 's' : ''}
        </p>
        {!showForm && (
          <button
            onClick={openAdd}
            className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity"
            style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
          >
            Add Tool
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg p-4 space-y-3"
          style={{ backgroundColor: '#25253D', border: '1px solid #E8C872' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            {editingId ? 'Edit Tool' : 'Add Tool'}
          </h3>

          {/* Name */}
          <div>
            <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md px-3 py-2 text-sm outline-none resize-y"
              style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
            />
          </div>

          {/* Category + Pricing row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Writing, Research, Coding"
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>Pricing</label>
              <select
                value={form.pricing}
                onChange={(e) => setForm({ ...form, pricing: e.target.value })}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
              >
                {PRICING_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order index + Alex recommends row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs block mb-1" style={{ color: '#D4D4E8' }}>Order Index</label>
              <input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
              />
            </div>
            <label className="flex items-center gap-2 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.alex_recommends}
                onChange={(e) => setForm({ ...form, alex_recommends: e.target.checked })}
                className="w-4 h-4 rounded accent-[#E8C872]"
              />
              <span className="text-sm" style={{ color: '#FFFFFF' }}>Alex Recommends</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-md px-4 py-2 text-sm transition-opacity"
              style={{ color: '#D4D4E8', border: '1px solid #363654' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tools list */}
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => openEdit(tool)}
            className="w-full rounded-lg p-4 text-left transition-all"
            style={{
              backgroundColor: '#25253D',
              border: editingId === tool.id ? '1px solid #E8C872' : '1px solid #363654',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Recommend indicator */}
              {tool.alex_recommends && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#E8C872' }}
                  title="Alex Recommends"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {tool.name}
                  </span>
                  {tool.alex_recommends && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                    >
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs" style={{ color: '#6B7280' }}>
                  {tool.category && <span>{tool.category}</span>}
                  {tool.pricing && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        color: pricingBadgeColour(tool.pricing),
                        border: `1px solid ${pricingBadgeColour(tool.pricing)}`,
                      }}
                    >
                      {tool.pricing}
                    </span>
                  )}
                  {tool.url && (
                    <span className="truncate max-w-[200px]" style={{ color: '#6B7280' }}>
                      {tool.url.replace(/^https?:\/\//, '').split('/')[0]}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>Edit</span>
            </div>
          </button>
        ))}

        {tools.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: '#6B7280' }}>
            No tools yet. Add your first AI tool above.
          </p>
        )}
      </div>
    </div>
  )
}
