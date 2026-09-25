import {
  MetricStripSkeleton,
  PageSkeleton,
  SkeletonCard,
} from "@/components/page-skeleton"

// Mirrors src/app/page.tsx: metric strip, then two columns of panels
// (leads-over-time, attribution, insights | revenue, goals, pipeline,
// leaderboard) that interleave below lg.
export default function Loading() {
  return (
    <PageSkeleton>
      <MetricStripSkeleton />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
          <SkeletonCard rows="chart-lg" />
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="text" />
        </div>
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="chart-md" />
          <SkeletonCard rows="rows" />
        </div>
      </div>
    </PageSkeleton>
  )
}
