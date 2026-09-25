import { PageSkeleton, SkeletonCard } from "@/components/page-skeleton"

// Mirrors src/app/analytics/page.tsx: two equal columns of three panels each.
export default function Loading() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="chart-sm" />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonCard rows="table" />
          <SkeletonCard rows="chart-lg" />
          <SkeletonCard rows="chart-md" />
        </div>
      </div>
    </PageSkeleton>
  )
}
