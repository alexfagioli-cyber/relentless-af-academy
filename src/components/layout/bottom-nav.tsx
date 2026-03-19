'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, isNavActive } from './nav-items'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-safe md:hidden" style={{ background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(232, 200, 114, 0.1)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-2"
            >
              {item.icon(isActive)}
              <span className="text-xs" style={{ color: isActive ? '#E8C872' : '#D4D4E8' }}>
                {item.label}
              </span>
              {isActive && (
                <span className="block w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#E8C872' }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
