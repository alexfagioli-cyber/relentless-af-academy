import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlaygroundClient } from './playground-client'

export default async function PlaygroundPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return <PlaygroundClient userId={user.id} />
}
