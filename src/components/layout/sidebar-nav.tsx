'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { navItems, isNavActive } from './nav-items'

const HIDDEN_PATHS = ['/auth', '/onboarding', '/welcome']

export function SidebarNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('learner_profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          setIsAdmin(profile?.is_admin ?? false)
        })
    })
  }, [])

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  const adminActive = pathname.startsWith('/admin')

  return (
    <nav className="hidden md:flex md:flex-col fixed top-0 left-0 h-full w-60 z-40 pt-8 px-4" style={{ background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRight: '1px solid rgba(232, 200, 114, 0.1)' }}>
      <div className="mb-10 px-3">
        <p className="text-sm font-bold" style={{ color: '#E8C872' }}>RelentlessAF</p>
        <div className="flex items-center gap-2">
          <p className="text-xs" style={{ color: '#D4D4E8' }}>Academy</p>
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: '#E8C872', border: '1px solid rgba(232, 200, 114, 0.3)', backgroundColor: 'rgba(232, 200, 114, 0.08)' }}>Beta</span>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
              style={{
                backgroundColor: active ? 'rgba(232, 200, 114, 0.1)' : 'transparent',
                borderLeft: active ? '2px solid #E8C872' : '2px solid transparent',
              }}
            >
              {item.icon(active)}
              <span className="text-sm" style={{ color: active ? '#E8C872' : '#D4D4E8' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {isAdmin && (
        <div className="mb-8">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
            style={{
              backgroundColor: adminActive ? 'rgba(232, 200, 114, 0.1)' : 'transparent',
              borderLeft: adminActive ? '2px solid #E8C872' : '2px solid transparent',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={adminActive ? '#E8C872' : '#D4D4E8'} className="w-5 h-5">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-sm" style={{ color: adminActive ? '#E8C872' : '#D4D4E8' }}>
              Admin
            </span>
          </Link>
        </div>
      )}
    </nav>
  )
}
