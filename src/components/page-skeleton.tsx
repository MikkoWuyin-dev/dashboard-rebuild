import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

/**
 * Shared building blocks for the per-route loading.tsx skeletons.
 *
 * The skeletons mirror the real page layouts (same grid shells, same panel
 * order) so a transition reads as the page taking shape rather than a
 * different page. Heights are approximations, not measurements: they hold the
 * layout open so scrollbars and shells do not jump when the real panels land.
 *
 * PageSkeleton carries aria-busy while mounted — the same settle signal
 * tools/shoot.mjs waits on before capturing, so a diff run always
 * photographs the finished page, never the skeleton.
 */

const CHART_HEIGHTS = {
  "chart-sm": "h-44",
  "chart-md": "h-64",
  "chart-lg": "h-80",
} as const

type SkeletonRows = keyof typeof CHART_HEIGHTS | "text" | "rows" | "table"

export function SkeletonText({
  width,
  className,
}: {
  width: string
  className?: string
}) {
  return <Skeleton className={cn("h-4", width, className)} />
}

/** Header block shared by every skeleton card: title, description, action. */
function SkeletonCardHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <SkeletonText width="w-36" />
        <SkeletonText width="w-48" className="h-3" />
      </div>
      <Skeleton className="size-8 rounded-lg" />
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-3 flex-1" style={{ maxWidth: `${88 - i * 18}%` }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="mt-4 flex flex-col gap-2.5">
      <Skeleton className="h-3 w-full" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-4 items-center gap-3">
          <Skeleton className="h-3" style={{ maxWidth: `${80 - (i % 3) * 12}%` }} />
          <Skeleton className="h-3" style={{ maxWidth: `${90 - (i % 2) * 15}%` }} />
          <Skeleton className="h-3" style={{ maxWidth: `${70 - (i % 4) * 8}%` }} />
          <Skeleton className="h-5 justify-self-end" style={{ width: "24%" }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({
  rows,
  className,
}: {
  rows: SkeletonRows
  className?: string
}) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-xl bg-card p-4 ring-1 ring-foreground/10", className)}
    >
      <SkeletonCardHeader />
      {rows === "text" ? (
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : rows === "rows" ? (
        <SkeletonRows />
      ) : rows === "table" ? (
        <SkeletonTable />
      ) : (
        <div className={cn("mt-4 w-full rounded-lg", CHART_HEIGHTS[rows])} />
      )}
    </div>
  )
}

/** The metric-strip shape shared by the root and leads top panels. */
export function MetricStripSkeleton() {
  return (
    <div
      data-slot="card"
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-w-0 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3.5 w-36" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true" data-slot="page-skeleton" className="contents">
      {children}
    </div>
  )
}
