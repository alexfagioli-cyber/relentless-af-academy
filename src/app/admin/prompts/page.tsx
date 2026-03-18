'use client'

import { AdminNav } from '../admin-nav'
import { useEffect, useState } from 'react'

interface PromptTemplate {
  id: string
  title: string
  category: string
  template: string
  description: string | null
  order_index: number
  created_at: string
}

interface FormState {
  title: string
  category: string
  template: string
  description: string
  order_index: number
}

const emptyForm: FormState = {
  title: '',
  category: '',
  template: '',
  description: '',
  order_index: 0,
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    fetchPrompts()
  }, [])

  async function fetchPrompts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prompts')
      if (!res.ok) throw new Error('Failed to load prompts')
      const data = await res.json()
      setPrompts(data.prompts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(prompt: PromptTemplate) {
    setEditingId(prompt.id)
    setForm({
      title: prompt.title,
      category: prompt.category,
      template: prompt.template,
      description: prompt.description ?? '',
      order_index: prompt.order_index,
    })
    setShowForm(true)
    setError(null)
  }

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.category.trim() || !form.template.trim()) {
      setError('Title, category, and template are required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { ...form, id: editingId } : form

      const res = await fetch('/api/admin/prompts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      cancelForm()
      await fetchPrompts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
        Prompt Templates
      </h1>
      <AdminNav />

      <div className="space-y-6 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: '#64748B' }}
          >
            Templates
          </h2>
          {!showForm && (
            <button
              onClick={startAdd}
              className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity"
              style={{ backgroundColor: '#E8C872', color: '#1E293B' }}
            >
              Add Prompt
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <p className="text-xs rounded-md px-3 py-2" style={{ color: '#E8C872', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            {error}
          </p>
        )}

        {/* Add / Edit form */}
        {showForm && (
          <form
            onSubmit={handleSave}
            className="rounded-lg p-4 space-y-4"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: '#1E293B' }}>
              {editingId ? 'Edit Prompt' : 'New Prompt'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="text-xs block mb-1" style={{ color: '#64748B' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
                  placeholder="e.g. Scenario Builder"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs block mb-1" style={{ color: '#64748B' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
                  placeholder="e.g. coaching, assessment"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs block mb-1" style={{ color: '#64748B' }}>
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
                placeholder="Short description of what this template does"
              />
            </div>

            {/* Template */}
            <div>
              <label className="text-xs block mb-1" style={{ color: '#64748B' }}>
                Template
              </label>
              <textarea
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                rows={8}
                className="w-full rounded-md px-3 py-2 text-sm outline-none resize-y"
                style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
                placeholder="Enter the prompt template text..."
              />
            </div>

            {/* Order index */}
            <div className="max-w-[120px]">
              <label className="text-xs block mb-1" style={{ color: '#64748B' }}>
                Order
              </label>
              <input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0' }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#E8C872', color: '#1E293B' }}
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity"
                style={{ backgroundColor: 'transparent', color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Prompt list */}
        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>
            Loading...
          </p>
        ) : prompts.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>
            No prompt templates yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => startEdit(p)}
                className="w-full rounded-lg p-4 text-left transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: editingId === p.id ? '1px solid #E8C872' : '1px solid #E2E8F0',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>
                        {p.title}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}
                      >
                        {p.category}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-xs mt-1 truncate" style={{ color: '#6B7280' }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>
                    #{p.order_index}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
