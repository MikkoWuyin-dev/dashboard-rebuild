import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type FunnelStage = {
  label: string
  count: number
  display: string
  share: string
}

// The funnel is drawn, not charted. It is a 1000x400 viewBox stretched to the
// panel (preserveAspectRatio="none"), split into five 200-wide segments with a
// 3.5 gap between them. Each segment is sampled at 33 points; the half-height
// at any x is a smoothstep between neighbouring stage heights, so the taper
// straddles the segment boundary instead of stepping at it. The top stage fills
// 80% of the height and every other stage is scaled to it by raw count.
const VIEW_W = 1000
const VIEW_H = 400
const SEG = 200
const GAP = 3.5
const SAMPLES = 33
const TOP_HALF = 160

// Nested three deep: a 1.22x halo at half opacity, a 1.11x solid band, and the
// gradient core.
const LAYERS = [1.22, 1.11, 1] as const

function build(stages: FunnelStage[]) {
  const halves = stages.map((s) => (TOP_HALF * s.count) / stages[0].count)
  const centres = stages.map((_, i) => SEG / 2 + SEG * i)
  const last = centres.length - 1

  function halfAt(x: number) {
    if (x <= centres[0]) return halves[0]
    if (x >= centres[last]) return halves[last]
    const i = Math.min(Math.floor((x - centres[0]) / SEG), last - 1)
    const t = (x - centres[i]) / SEG
    const s = 3 * t * t - 2 * t * t * t
    return halves[i] + s * (halves[i + 1] - halves[i])
  }

  return function band(index: number, scale: number) {
    const x0 = index * SEG + (index > 0 ? GAP : 0)
    const x1 = index * SEG + SEG - (index < stages.length - 1 ? GAP : 0)
    const step = (x1 - x0) / (SAMPLES - 1)
    const xs = Array.from({ length: SAMPLES }, (_, j) => x0 + j * step)
    const f = (n: number) => n.toFixed(1)
    const top = xs.map((x) => `${f(x)},${f(VIEW_H / 2 - halfAt(x) * scale)}`)
    const bottom = [...xs]
      .reverse()
      .map((x) => `${f(x)},${f(VIEW_H / 2 + halfAt(x) * scale)}`)
    return `M${top.join("L")}L${bottom.join("L")}Z`
  }
}

export function FunnelPanel({
  id,
  title,
  description,
  stages,
  caption,
}: {
  id: string
  title: string
  description: string
  stages: FunnelStage[]
  caption: (stage: FunnelStage) => string
}) {
  const band = build(stages)
  const gradientId = `funnel-ramp-${id}`
  return (
    <Card className="h-90">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="relative min-h-0 flex-1">
            <svg
              aria-hidden="true"
              className="size-full"
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  x2={VIEW_W}
                >
                  <stop offset="0.1" stopColor="var(--chart-1)" />
                  <stop offset="0.3" stopColor="var(--chart-2)" />
                  <stop offset="0.5" stopColor="var(--chart-3)" />
                  <stop offset="0.7" stopColor="var(--chart-4)" />
                  <stop offset="0.9" stopColor="var(--chart-5)" />
                </linearGradient>
              </defs>
              {stages.map((stage, i) => (
                <g key={stage.label} opacity="1">
                  <path
                    d={band(i, LAYERS[0])}
                    fill="var(--chart-1)"
                    fillOpacity="0.5"
                  />
                  <path d={band(i, LAYERS[1])} fill="var(--chart-1)" />
                  <path d={band(i, LAYERS[2])} fill={`url(#${gradientId})`} />
                  <rect
                    x={i * SEG}
                    y="0"
                    width={SEG}
                    height={VIEW_H}
                    fill="transparent"
                  />
                </g>
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-center gap-1.5">
              {stages.map((stage) => (
                <span
                  key={stage.label}
                  className="flex min-w-0 flex-1 justify-center"
                >
                  <span className="rounded-full bg-background/85 px-1.5 text-xs font-semibold tabular-nums">
                    {stage.share}
                  </span>
                </span>
              ))}
            </div>
            <ul className="sr-only">
              {stages.map((stage) => (
                <li key={stage.label}>{caption(stage)}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-1 sm:gap-6">
            {stages.map((stage) => (
              <span
                key={stage.label}
                className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground"
              >
                {stage.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
