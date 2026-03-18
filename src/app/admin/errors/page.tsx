import { createAdminClient } from '@/lib/supabase/admin'
import { AdminNav } from '../admin-nav'
import { ErrorsList } from './errors-list'

export default async function AdminErrorsPage() {
  const adminClient = createAdminClient()

  const { data: errors, error } = await adminClient
    .from('platform_errors')
    .select('id, error_type, message, stack, page, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#E8F0FE' }}>Admin</h1>
        <p className="text-sm mb-4" style={{ color: '#8BA3C4' }}>Errors</p>
        <AdminNav />
        <p style={{ color: '#EF4444' }}>Failed to load errors: {error.message}</p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#E8F0FE' }}>Admin</h1>
      <p className="text-sm mb-4" style={{ color: '#8BA3C4' }}>Errors</p>
      <AdminNav />
      <ErrorsList errors={errors ?? []} />
    </>
  )
}
