"use client"

import * as React from "react"

import { cn } from "cn"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import dealsFixture from "@/data/deals-fixture.json"

export type Deal = {
  initials: string
  company: string
  type: string
  industry: string
  winProbability: number
  city: string
  region: string
  closeDate: string
  amount: string
  status: string
  forecast: string
}

export type DealStage = {
  stage: string
  count: number
  value: string
  deals: Deal[]
}

const STAGES: DealStage[] = dealsFixture

// The target's status badges map to semantic badge variants (warning for
// at-risk, success for committed), not hardcoded hex.
const statusVariant: Record<
  string,
  "outline" | "secondary" | "success" | "warning"
> = {
  New: "outline",
  Working: "secondary",
  "On track": "secondary",
  "At risk": "warning",
  Committed: "success",
}

// The target cycles person-1..7 photos from assets.shadcncraft.com; both
// sides mask [data-slot=avatar-image] during diffing, so our cards render
// the fixture's initials as the visible avatar fallback instead.

function GripVertical(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  )
}

function MapPin(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CalendarIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 2v3" />
      <path d="M16 2v3" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
    </svg>
  )
}

function Banknote(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function Plus(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

const COLUMN_CLASS =
  "flex flex-col gap-1.5 rounded-2xl bg-muted p-1.5 w-72 shrink-0 data-[dragging=true]:opacity-40"
const GRIP_CLASS =
  "inline-flex shrink-0 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0 cursor-grab active:cursor-grabbing"
const CARD_CLASS =
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl cursor-grab touch-none active:cursor-grabbing data-[dragging=true]:opacity-40"

function DealCard({ deal }: { deal: Deal }) {
  const statusSlug = deal.status.toLowerCase().replace(/\s+/g, "-")

  return (
    <div
      data-slot="deal-card"
      data-size="sm"
      className={CARD_CLASS}
      data-status={statusSlug}
      data-dragging="false"
      role="button"
      tabIndex={0}
    >
      <div data-slot="card-content" className="px-(--card-spacing)">
        <div data-slot="deal-card-content" className="flex flex-col gap-3">
          <div
            data-slot="deal-card-header"
            data-variant="default"
            data-size="xs"
            className="group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted border-transparent gap-2 in-data-[slot=dropdown-menu-content]:p-0 p-0"
          >
            <div
              data-slot="item-media"
              data-variant="default"
              className="flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none bg-transparent"
            >
              <Avatar>
                <AvatarFallback>{deal.initials}</AvatarFallback>
              </Avatar>
            </div>
            <div
              data-slot="item-content"
              className="flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none"
            >
              <div
                data-slot="item-title"
                className="line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4"
              >
                {deal.company}
              </div>
              <p
                data-slot="item-description"
                className="line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary"
              >
                {deal.type} · {deal.industry}
              </p>
            </div>
          </div>

          <div data-slot="deal-card-probability" className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Win prob.</span>
              <span className="font-medium tabular-nums">{deal.winProbability}%</span>
            </div>
            <div
              data-progressing=""
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={deal.winProbability}
              aria-valuetext={`${deal.winProbability}%`}
              role="progressbar"
              data-slot="progress"
              className="flex flex-wrap gap-3 **:data-[slot=progress-indicator]:bg-chart-3"
            >
              <div
                data-progressing=""
                data-slot="progress-track"
                className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted"
              >
                <div
                  data-progressing=""
                  style={{
                    insetInlineStart: 0,
                    height: "inherit",
                    width: `${deal.winProbability}%`,
                  }}
                  data-slot="progress-indicator"
                  className="h-full bg-primary transition-all"
                />
              </div>
              <span
                role="presentation"
                style={{
                  clipPath: "inset(50%)",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  border: 0,
                  padding: 0,
                  width: 1,
                  height: 1,
                  margin: -1,
                  position: "fixed",
                  top: 0,
                  left: 0,
                }}
              >
                x
              </span>
            </div>
          </div>

          <dl data-slot="deal-card-details" className="flex flex-col gap-2.5">
            <div data-slot="deal-card-detail" className="flex gap-1.5">
              <dt className="pt-0.5 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
                <MapPin />
              </dt>
              <dd className="flex min-w-0 flex-1 items-center gap-1">
                <span className="min-w-0 flex-1 truncate text-sm">{deal.city}</span>
                <Badge variant="outline" className="shrink-0">
                  {deal.region}
                </Badge>
              </dd>
            </div>
            <div data-slot="deal-card-detail" className="flex gap-1.5">
              <dt className="pt-0.5 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
                <CalendarIcon />
              </dt>
              <dd className="flex min-w-0 flex-1 items-center gap-1">
                <span className="min-w-0 flex-1 truncate text-sm">{deal.closeDate}</span>
              </dd>
            </div>
            <div data-slot="deal-card-detail" className="flex gap-1.5">
              <dt className="pt-0.5 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
                <Banknote />
              </dt>
              <dd className="flex min-w-0 flex-1 items-center gap-1">
                <span className="min-w-0 flex-1 truncate text-sm">{deal.amount}</span>
              </dd>
            </div>
          </dl>

          <div data-slot="deal-card-status" className="flex items-center justify-between">
            <Badge variant={statusVariant[deal.status] ?? "outline"}>{deal.status}</Badge>
            <span className="text-xs text-muted-foreground">{deal.forecast}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DealsBoard() {
  const [stages, setStages] = React.useState<DealStage[]>(STAGES)
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)

  const dragIndexRef = React.useRef<number | null>(null)
  const dxRef = React.useRef(0)
  const [dragX, setDragX] = React.useState(0)

  const beginColumnDrag = (index: number) => (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    const startX = event.clientX
    dragIndexRef.current = index
    setDragIndex(index)
    setDragX(0)

    const onMove = (e: PointerEvent) => {
      dxRef.current = e.clientX - startX
      setDragX(dxRef.current)
    }
    const onEnd = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onEnd)
      window.removeEventListener("pointercancel", onEnd)
      // Capture and clear BEFORE the updater: React 19 dev double-invokes
      // updaters, so they must stay pure (no ref side effects inside).
      const from = dragIndexRef.current
      const dx = dxRef.current
      dragIndexRef.current = null
      dxRef.current = 0
      setDragIndex(null)
      setDragX(0)
      if (from !== null) {
        setStages((prev) => {
          const width = 288 + 12 // w-72 column + gap-3
          const to = Math.round(from + dx / width)
          if (to === from || to < 0 || to >= prev.length) return prev
          const next = [...prev]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          return next
        })
      }
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onEnd)
    window.addEventListener("pointercancel", onEnd)
  }

  return (
    <div
      className="no-scrollbar flex scroll-fade-x gap-3 overflow-x-auto pb-1.5 scroll-fade-5"
    >
      {stages.map((stage, i) => (
        <section
          key={stage.stage}
          data-slot="kanban-column"
          className={COLUMN_CLASS}
          data-dragging={dragIndex === i ? "true" : "false"}
          style={
            dragIndex === i
              ? { transform: `translateX(${dragX}px)` }
              : undefined
          }
        >
          <header
            data-slot="kanban-column-header"
            className="flex items-center gap-1.5 px-1.5 pt-1.5"
          >
            <span
              data-slot="kanban-column-grip"
              className={GRIP_CLASS}
              role="button"
              tabIndex={0}
              aria-roledescription="sortable"
              aria-label={`Reorder ${stage.stage}`}
              onPointerDown={beginColumnDrag(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault()
                  const dir = e.key === "ArrowLeft" ? -1 : 1
                  setStages((prev) => {
                    const to = i + dir
                    if (to < 0 || to >= prev.length) return prev
                    const next = [...prev]
                    const [moved] = next.splice(i, 1)
                    next.splice(to, 0, moved)
                    return next
                  })
                }
              }}
            >
              <GripVertical />
              <span className="sr-only">Reorder {stage.stage}</span>
            </span>
            <span
              data-slot="kanban-column-dot"
              className={cn(
                "size-2 shrink-0 rounded-full",
                `bg-chart-${i + 1}`
              )}
            />
            <span className="text-sm font-medium">{stage.stage}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {stage.count}
            </span>
            <span className="flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {stage.value}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Add deal to ${stage.stage}`}
            >
              <Plus />
            </Button>
          </header>
          <div
            data-slot="kanban-column-cards"
            className="flex flex-col gap-1.5 min-h-16"
          >
            {stage.deals.map((deal) => (
              <DealCard key={deal.company} deal={deal} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
