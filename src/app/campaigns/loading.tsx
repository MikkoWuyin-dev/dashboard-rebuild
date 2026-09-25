import { PageSkeleton, SkeletonCard } from "@/components/page-skeleton"

// Mirrors src/app/campaigns/page.tsx: full-width campaign table, then two
// side-by-side pairs of panels.
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonCard rows="table" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard rows="chart-md" />
        <SkeletonCard rows="chart-sm" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard rows="chart-md" />
        <SkeletonCard rows="chart-md" />
      </div>
    </PageSkeleton>
  )
}
