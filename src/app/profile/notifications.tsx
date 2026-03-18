'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface Props {
  userId: string
}

interface Prefs {
  streak_reminders: boolean
  new_content_alerts: boolean
  community_activity: boolean
  share_completions: boolean
}

const DEFAULTS: Prefs = {
  streak_reminders: true,
  new_content_alerts: true,
  community_activity: true,
  share_completions: true,
}

const LABELS: Record<keyof Prefs, { title: string; desc: string }> = {
  streak_reminders: { title: 'Streak reminders', desc: 'Get reminded to keep your streak going' },
  new_content_alerts: { title: 'New content alerts', desc: 'Know when new modules or resources are added' },
  community_activity: { title: 'Community activity', desc: 'Updates from other learners in the programme' },
  share_completions: { title: 'Share my completions', desc: 'Let others see when you finish a module' },
}

export function NotificationPreferences({ userId }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('learner_id', userId)
        .single()

      if (data) {
        setPrefs({
          streak_reminders: data.streak_reminders,
          new_content_alerts: data.new_content_alerts,
          community_activity: data.community_activity,
          share_completions: data.share_completions,
        })
      }
      setLoaded(true)
    }
    load()
  }, [userId])

  async function toggle(key: keyof Prefs) {
    const newVal = !prefs[key]
    setPrefs((prev) => ({ ...prev, [key]: newVal }))

    const supabase = createClient()
    await supabase
      .from('notification_preferences')
      .upsert({
        learner_id: userId,
        ...prefs,
        [key]: newVal,
      }, { onConflict: 'learner_id' })
  }

  if (!loaded) return null

  return (
    <div className="space-y-1">
      {(Object.keys(LABELS) as Array<keyof Prefs>).map((key) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: '#1E293B' }}>{LABELS[key].title}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>{LABELS[key].desc}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ backgroundColor: prefs[key] ? '#E8C872' : '#E2E8F0' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: prefs[key] ? '#1E293B' : '#64748B',
                transform: prefs[key] ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
