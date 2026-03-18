import { createAdminClient } from '@/lib/supabase/admin'
import { AdminNav } from '../admin-nav'
import { ModuleManager } from './module-manager'

export default async function AdminModulesPage() {
  const adminClient = createAdminClient()

  const { data: modules, error } = await adminClient
    .from('modules')
    .select('id, title, description, tier, track, module_type, platform, external_url, estimated_duration_mins, order_index, content, video_url, video_thumbnail, created_at')
    .order('order_index', { ascending: true })

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#1E293B' }}>Admin</h1>
        <p className="text-sm mb-4" style={{ color: '#64748B' }}>Module Manager</p>
        <AdminNav />
        <p style={{ color: '#D4A31E' }}>Failed to load modules: {error.message}</p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1E293B' }}>Admin</h1>
      <p className="text-sm mb-4" style={{ color: '#64748B' }}>Module Manager</p>
      <AdminNav />
      <ModuleManager modules={modules ?? []} />
    </>
  )
}
