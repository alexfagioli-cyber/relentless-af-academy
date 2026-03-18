import { Skeleton } from '@/components/ui/skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function AdminLoading() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>

        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
