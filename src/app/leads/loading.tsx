import {
  MetricStripSkeleton,
  PageSkeleton,
  SkeletonCard,
} from "@/components/page-skeleton"

// Mirrors src/app/leads/page.tsx: metric strip, two charts, then the recent
// leads table beside the region card at a 3fr/2fr split.
export default function Loading() {
  return (
    <PageSkeleton>
      <MetricStripSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard rows="chart-lg" />
        <SkeletonCard rows="chart-md" />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <SkeletonCard rows="table" />
        <SkeletonCard rows="rows" />
      </div>
    </PageSkeleton>
  )
}
