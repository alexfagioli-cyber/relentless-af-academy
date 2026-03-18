import { createAdminClient } from '@/lib/supabase/admin'
import { AdminNav } from '../admin-nav'
import { ToolsManager } from './tools-manager'

export default async function AdminToolsPage() {
  const adminClient = createAdminClient()

  const { data: tools, error } = await adminClient
    .from('ai_tools')
    .select('id, name, description, url, category, pricing, alex_recommends, order_index, created_at')
    .order('order_index', { ascending: true })

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#E8F0FE' }}>Admin</h1>
        <p className="text-sm mb-4" style={{ color: '#8BA3C4' }}>AI Tools Manager</p>
        <AdminNav />
        <p style={{ color: '#E8C872' }}>Failed to load tools: {error.message}</p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#E8F0FE' }}>Admin</h1>
      <p className="text-sm mb-4" style={{ color: '#8BA3C4' }}>AI Tools Manager</p>
      <AdminNav />
      <ToolsManager tools={tools ?? []} />
    </>
  )
}
