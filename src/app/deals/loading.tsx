import { PageSkeleton, SkeletonCard } from "@/components/page-skeleton"

/** The kanban board's shape: one card with N stage columns of stacked mini-cards. */
function KanbanSkeleton() {
  return (
    <div
      data-slot="card"
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-36 rounded-md bg-muted" />
          <div className="h-3 w-48 rounded-md bg-muted" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((col) => (
          <div key={col} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2">
            <div className="h-3.5 w-20 rounded-md bg-muted" />
            {[0, 1].map((row) => (
              <div
                key={row}
                className="flex flex-col gap-2 rounded-lg bg-card p-3 ring-1 ring-foreground/10"
              >
                <div
                  className="h-3 rounded-md bg-muted"
                  style={{ width: `${90 - row * 22}%` }}
                />
                <div className="h-2.5 w-2/3 rounded-md bg-muted" />
                <div className="mt-1 h-1.5 w-full rounded-[2px] bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Mirrors src/app/deals/page.tsx: kanban board, open-deals table, then
// velocity and win-rate side by side.
export default function Loading() {
  return (
    <PageSkeleton>
      <KanbanSkeleton />
      <SkeletonCard rows="table" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard rows="chart-md" />
        <SkeletonCard rows="chart-md" />
      </div>
    </PageSkeleton>
  )
}
