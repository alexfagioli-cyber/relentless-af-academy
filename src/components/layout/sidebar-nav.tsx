'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, isNavActive } from './nav-items'

const HIDDEN_PATHS = ['/auth', '/onboarding', '/welcome']

export function SidebarNav() {
  const pathname = usePathname()

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  return (
    <nav className="hidden md:flex md:flex-col fixed top-0 left-0 h-full w-60 z-40 pt-8 px-4" style={{ background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRight: '1px solid rgba(232, 200, 114, 0.1)' }}>
      <div className="mb-10 px-3">
        <p className="text-sm font-bold" style={{ color: '#E8C872' }}>RelentlessAF</p>
        <p className="text-xs" style={{ color: '#D4D4E8' }}>Academy</p>
      </div>

      <div className="space-y-1">
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
    </nav>
  )
}
