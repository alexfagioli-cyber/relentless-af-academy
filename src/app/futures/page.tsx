import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { redirect } from 'next/navigation'
import { FuturesClient } from './futures-client'

export default async function FuturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'transparent' }}>
      <FuturesClient />
      <BottomNav />
    </div>
  )
}
