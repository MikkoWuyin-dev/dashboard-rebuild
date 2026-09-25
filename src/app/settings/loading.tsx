import { Skeleton } from "@/components/ui/skeleton"
import { PageSkeleton } from "@/components/page-skeleton"

// Mirrors src/app/settings/page.tsx: heading, tab list, separator, a stack of
// label-plus-input fields divided by separators, then right-aligned actions.
// Settings has no cards, so this one is bespoke rather than SkeletonCard.
export default function Loading() {
  return (
    <PageSkeleton>
      <div className="flex flex-col">
        <div className="flex flex-col gap-3 p-4 lg:gap-4 lg:p-7">
          <Skeleton className="h-7 w-28" />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 rounded-lg" style={{ width: `${88 + i * 12}px` }} />
            ))}
          </div>
          <Skeleton className="h-px w-full" />
        </div>
        <div className="flex flex-col gap-7 px-4 pt-4 lg:px-7">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 lg:flex-row lg:items-start">
              <div className="flex flex-col gap-1.5 lg:w-80 lg:flex-none">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-9 w-full lg:w-70" />
            </div>
          ))}
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-1.5 lg:w-80 lg:flex-none">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-24 w-full lg:w-104" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-7 lg:px-7">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </PageSkeleton>
  )
}
