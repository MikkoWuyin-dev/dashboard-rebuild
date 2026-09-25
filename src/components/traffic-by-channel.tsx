import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import fixture from "@/data/analytics-fixture.json"

// The stacked bar is plain flexbox, not a chart: each segment takes flex-grow
// equal to its raw value, so the widths come out proportional for free.
const TONE = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

export function TrafficByChannel() {
  const { total, delta, note, channels } = fixture.traffic
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic by channel</CardTitle>
        <CardDescription>Traffic break down across channels</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {total}
          </span>
          <span className="text-sm font-medium tabular-nums text-success">
            {delta}
          </span>
          <span className="text-sm text-muted-foreground">{note}</span>
        </div>
        <div className="flex items-center gap-1">
          {channels.map((c, i) => (
            <div
              key={c.label}
              className={`h-2.5 rounded-full ${TONE[i]}`}
              style={{ flexGrow: c.value }}
            />
          ))}
        </div>
        <ul className="flex flex-col gap-3">
          {channels.map((c, i) => (
            <li
              key={c.label}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${TONE[i]}`}
                />
                <span className="truncate text-sm">{c.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
                <span className="font-medium">{c.count}</span>
                <span className="text-muted-foreground">{c.share}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
