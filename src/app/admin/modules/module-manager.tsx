'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Module {
  id: string
  title: string
  description: string | null
  tier: string
  track: number
  module_type: string
  platform: string | null
  external_url: string | null
  estimated_duration_mins: number | null
  order_index: number
  content: unknown
  video_url: string | null
  video_thumbnail: string | null
  created_at: string
}

interface FormData {
  title: string
  description: string
  tier: string
  track: number
  module_type: string
  platform: string
  external_url: string
  estimated_duration_mins: string
  order_index: string
  content: string
}

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  tier: 'aware',
  track: 1,
  module_type: 'course',
  platform: '',
  external_url: '',
  estimated_duration_mins: '',
  order_index: '',
  content: '',
}

const TIER_OPTIONS = ['aware', 'enabled', 'specialist'] as const
const TYPE_OPTIONS = ['course', 'challenge', 'assessment'] as const
const PLATFORM_OPTIONS = ['skilljar', 'github', 'coursera', 'claudecertifications', 'internal'] as const

const TIER_COLOURS: Record<string, string> = {
  aware: '#4CAF50',
  enabled: '#2196F3',
  specialist: '#E8C872',
}

const TYPE_LABELS: Record<string, string> = {
  course: 'Course',
  challenge: 'Challenge',
  assessment: 'Assessment',
}

export function ModuleManager({ modules }: { modules: Module[] }) {
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

  function openEdit(mod: Module) {
    setEditingId(mod.id)
    setForm({
      title: mod.title,
      description: mod.description ?? '',
      tier: mod.tier,
      track: mod.track,
      module_type: mod.module_type,
      platform: mod.platform ?? '',
      external_url: mod.external_url ?? '',
      estimated_duration_mins: mod.estimated_duration_mins?.toString() ?? '',
      order_index: mod.order_index.toString(),
      content: mod.content ? JSON.stringify(mod.content, null, 2) : '',
    })
    setShowForm(true)
    setError(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSave() {
    setError(null)

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.order_index) {
      setError('Order index is required')
      return
    }

    // Validate JSON content if provided
    let parsedContent = null
    if (form.content.trim()) {
      try {
        parsedContent = JSON.parse(form.content)
      } catch {
        setError('Content must be valid JSON')
        return
      }
    }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        tier: form.tier,
        track: form.track,
        module_type: form.module_type,
        platform: form.platform || null,
        external_url: form.external_url.trim() || null,
        estimated_duration_mins: form.estimated_duration_mins ? parseInt(form.estimated_duration_mins) : null,
        order_index: parseInt(form.order_index),
        content: parsedContent,
      }
      if (editingId) body.id = editingId

      const res = await fetch('/api/admin/modules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Save failed')
        return
      }

      closeForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1A1A2E',
    border: '1px solid #363654',
    color: '#E8F0FE',
    borderRadius: 6,
    padding: '8px 12px',
    width: '100%',
    fontSize: 14,
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'auto' as const,
  }

  const labelStyle: React.CSSProperties = {
    color: '#8BA3C4',
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div>
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <p style={{ color: '#8BA3C4', fontSize: 14 }}>
          {modules.length} module{modules.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
        >
          Add Module
        </button>
      </div>

      {/* Form overlay */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm() }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg p-6"
            style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: '#E8F0FE' }}>
              {editingId ? 'Edit Module' : 'Add Module'}
            </h2>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Module title"
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60 }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>

              {/* Tier + Type row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Tier *</label>
                  <select
                    style={selectStyle}
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select
                    style={selectStyle}
                    value={form.module_type}
                    onChange={(e) => setForm({ ...form, module_type: e.target.value })}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Track + Order row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Track</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.track}
                    onChange={(e) => setForm({ ...form, track: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Order Index *</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {/* Platform + Duration row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Platform</label>
                  <select
                    style={selectStyle}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="">None</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration (mins)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.estimated_duration_mins}
                    onChange={(e) => setForm({ ...form, estimated_duration_mins: e.target.value })}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {/* External URL */}
              <div>
                <label style={labelStyle}>External URL</label>
                <input
                  style={inputStyle}
                  value={form.external_url}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Content JSON */}
              <div>
                <label style={labelStyle}>Content (JSON)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 120, fontFamily: 'monospace', fontSize: 12 }}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder='{"screens": [...]}'
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: saving ? '#363654' : '#E8C872',
                    color: '#1A1A2E',
                  }}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Module' : 'Create Module'}
                </button>
                <button
                  onClick={closeForm}
                  className="px-4 py-2 rounded-md text-sm"
                  style={{ border: '1px solid #363654', color: '#8BA3C4' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module list */}
      <div className="space-y-2">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
          >
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: '#E8F0FE' }}
                >
                  {mod.title}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: TIER_COLOURS[mod.tier] ?? '#666',
                    color: '#1A1A2E',
                    fontWeight: 600,
                  }}
                >
                  {mod.tier}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded shrink-0"
                  style={{ backgroundColor: '#363654', color: '#8BA3C4' }}
                >
                  {TYPE_LABELS[mod.module_type] ?? mod.module_type}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-xs" style={{ color: '#8BA3C4' }}>
                <span>#{mod.order_index}</span>
                {mod.platform && <span>{mod.platform}</span>}
                {mod.estimated_duration_mins && <span>{mod.estimated_duration_mins}m</span>}
              </div>
            </div>
            <button
              onClick={() => openEdit(mod)}
              className="px-3 py-1.5 rounded text-xs font-medium shrink-0"
              style={{ border: '1px solid #363654', color: '#E8C872' }}
            >
              Edit
            </button>
          </div>
        ))}

        {modules.length === 0 && (
          <p className="text-center py-8" style={{ color: '#8BA3C4' }}>
            No modules yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  )
}
