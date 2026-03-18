import { Skeleton } from '@/components/ui/skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function LearnLoading() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Skeleton className="h-8 w-40 mb-6" />

        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
