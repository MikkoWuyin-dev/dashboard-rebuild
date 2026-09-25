import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import fixture from "@/data/root-fixture.json"

const [closed, target, forecast] = fixture.revenue.stats
const TOTAL = fixture.revenue.segments

// The bar is TOTAL equal ticks, not a chart: closed revenue fills the first
// stretch in a chart-2 to chart-3 gradient, the forecast carries on in flat
// chart-1, and whatever is still short of target stays muted.
const closedTicks = Math.round((closed.amount / target.amount) * TOTAL)
const forecastTicks =
  Math.round((forecast.amount / target.amount) * TOTAL) - closedTicks

function tone(i: number) {
  if (i < closedTicks) return "bg-linear-to-b from-chart-2 to-chart-3"
  if (i < closedTicks + forecastTicks) return "bg-chart-1"
  return "bg-muted"
}

export function RevenueVsTarget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs target</CardTitle>
        <CardDescription>Q3 target, quarter to date</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex gap-3">
          {fixture.revenue.stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-xs text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex h-10 gap-0.5 sm:gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span
              key={i}
              className={`min-w-0 flex-1 rounded-sm ${tone(i)}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
