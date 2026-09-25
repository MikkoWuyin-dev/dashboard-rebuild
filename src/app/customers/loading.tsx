import { PageSkeleton, SkeletonCard } from "@/components/page-skeleton"

// Mirrors src/app/customers/page.tsx: gauge + leaderboard cards first from lg,
// the customers table first at narrow widths (order-1/order-2 swap).
export default function Loading() {
  return (
    <PageSkeleton>
      <div className="order-2 grid grid-cols-1 gap-4 lg:order-1 lg:grid-cols-2">
        <SkeletonCard rows="chart-sm" />
        <SkeletonCard rows="rows" />
      </div>
      <div className="order-1 lg:order-2">
        <SkeletonCard rows="table" />
      </div>
    </PageSkeleton>
  )
}
