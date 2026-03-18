'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/admin' },
  { label: 'Learners', href: '/admin/learners' },
  { label: 'Modules', href: '/admin/modules' },
  { label: 'News', href: '/admin/news' },
  { label: 'Prompts', href: '/admin/prompts' },
  { label: 'Tools', href: '/admin/tools' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Errors', href: '/admin/errors' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="mb-6 overflow-x-auto -mx-4 px-4">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? '#E8C872' : '#25253D',
                color: isActive ? '#1A1A2E' : '#8BA3C4',
                border: isActive ? 'none' : '1px solid #363654',
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
