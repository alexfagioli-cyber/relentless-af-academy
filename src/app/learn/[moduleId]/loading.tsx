import { Skeleton } from '@/components/ui/skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function ModuleLoading() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Skeleton className="h-4 w-32 mb-6" />

        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-3/4" />
        </div>

        <Skeleton className="h-24 mb-6" />
        <Skeleton className="h-12" />
      </div>
      <BottomNav />
    </div>
  )
}
