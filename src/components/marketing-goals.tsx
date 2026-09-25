import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import fixture from "@/data/root-fixture.json"

// Each bar runs to 120% of its target, so the dashed target marker always lands
// at 83.3333% and the fill shows how much headroom is left beyond goal. That is
// what produces the reference's 82.3526% / 78.6111% / 63.75% fills.
const HEADROOM = 1.2
const MARKER = `${(100 / HEADROOM).toFixed(4)}%`

export function MarketingGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing goals</CardTitle>
        <CardDescription>
          Month-to-date attainment against monthly targets
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <ul className="flex flex-col gap-6">
          {fixture.goals.map((goal) => (
            <li key={goal.label} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">
                  {goal.label}
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {goal.display}
                </span>
              </div>
              <div className="relative">
                <Progress
                  aria-label={goal.label}
                  className="**:data-[slot=progress-indicator]:bg-chart-3"
                  value={goal.value}
                  max={goal.target * HEADROOM}
                />
                <span
                  className="absolute inset-y-0 border-l border-dashed border-muted-foreground"
                  style={{ left: MARKER }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
