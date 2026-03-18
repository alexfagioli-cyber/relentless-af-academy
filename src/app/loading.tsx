import { Skeleton } from '@/components/ui/skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20 hidden sm:block" />
        </div>

        <Skeleton className="h-24 mb-6" />
        <Skeleton className="h-12" />
      </div>
      <BottomNav />
    </div>
  )
}
