'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '../admin-nav'

interface NewsItem {
  id: string
  title: string
  description: string | null
  url: string
  category: string
  published_at: string | null
  created_at: string
  hidden: boolean
}

const CATEGORIES = ['news', 'feature', 'tip', 'use-case']

const EMPTY_FORM = {
  title: '',
  description: '',
  url: '',
  category: 'news',
  published_at: new Date().toISOString().slice(0, 16),
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/news')
      if (!res.ok) throw new Error('Failed to fetch news items')
      const data = await res.json()
      setItems(data.items ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load news items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setError('Title and URL are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? { id: editingId, ...form }
        : form
      const res = await fetch('/api/admin/news', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
      await fetchItems()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: NewsItem) => {
    setForm({
      title: item.title,
      description: item.description ?? '',
      url: item.url,
      category: item.category,
      published_at: item.published_at
        ? new Date(item.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    })
    setEditingId(item.id)
    setShowForm(true)
    setError(null)
  }

  const handleHide = async (id: string, hidden: boolean) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hidden }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update')
      }
      await fetchItems()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
        Admin
      </h1>
      <AdminNav />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: '#1E293B' }}>
          News Items
        </h2>
        {!showForm && (
          <button
            onClick={() => {
              setForm(EMPTY_FORM)
              setEditingId(null)
              setShowForm(true)
              setError(null)
            }}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ backgroundColor: '#D4A31E', color: '#1E293B' }}
          >
            + Add News Item
          </button>
        )}
      </div>

      {error && (
        <div
          className="rounded-lg p-3 mb-4 text-sm"
          style={{ backgroundColor: '#3D2525', border: '1px solid #654040', color: '#F8A0A0' }}
        >
          {error}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1E293B' }}>
            {editingId ? 'Edit News Item' : 'New News Item'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748B' }}>
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                }}
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748B' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded px-3 py-2 text-sm outline-none resize-y"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                }}
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748B' }}>
                URL *
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                }}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748B' }}>
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#1E293B',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748B' }}>
                  Published At
                </label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  className="w-full rounded px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#1E293B',
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#D4A31E', color: '#1E293B' }}
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded text-xs font-medium transition-colors"
                style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <p className="text-sm" style={{ color: '#64748B' }}>
          Loading...
        </p>
      ) : items.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <p className="text-sm" style={{ color: '#64748B' }}>
            No news items yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                opacity: item.hidden ? 0.5 : 1,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: '#1E293B' }}
                  >
                    {item.title}
                  </p>
                  {item.hidden && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                      style={{ backgroundColor: '#3D2525', color: '#F8A0A0' }}
                    >
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#E2E8F0', color: '#D4A31E' }}
                  >
                    {item.category}
                  </span>
                  {item.published_at && (
                    <span className="text-[10px]" style={{ color: '#6B7280' }}>
                      {new Date(item.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                  style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleHide(item.id, !item.hidden)}
                  disabled={saving}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: item.hidden ? '#2D3A2D' : '#3D2525',
                    color: item.hidden ? '#86EFAC' : '#F8A0A0',
                  }}
                >
                  {item.hidden ? 'Show' : 'Hide'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
