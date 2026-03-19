'use client'

import { usePathname } from 'next/navigation'

const FULL_WIDTH_PATHS = ['/auth', '/onboarding', '/welcome']

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullWidth = FULL_WIDTH_PATHS.some((p) => pathname.startsWith(p))

  return (
    <div className={isFullWidth ? '' : 'md:ml-60'}>
      {children}
    </div>
  )
}
