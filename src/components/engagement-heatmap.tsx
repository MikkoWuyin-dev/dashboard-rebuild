import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import fixture from "@/data/campaigns-fixture.json"

const { hours, days, rows } = fixture.engagement
const flat = rows.flat()
const min = Math.min(...flat)
const max = Math.max(...flat)

// Open rate maps to opacity on bg-chart-3, 0.12 at the quietest hour to 0.95 at
// the busiest. Verified against the reference: 9% -> 0.137292, 12% -> 0.189167,
// 56% -> 0.95, with min 8 and max 56. (Deal velocity runs 0.1 to 0.95 -- the
// two heatmaps genuinely use different ramps.)
const LOW = 0.12
const HIGH = 0.95
const opacityFor = (v: number) => LOW + ((HIGH - LOW) * (v - min)) / (max - min)

export function EngagementHeatmap() {
  return (
    <Card className="h-90">
      {/* Below sm the reference drops the header grid so the title keeps a
          full-width line instead of wrapping beside the legend. */}
      <CardHeader className="max-sm:flex max-sm:flex-col">
        <CardTitle>Engagement by day &amp; hour</CardTitle>
        <CardDescription>Open rate by send time</CardDescription>
        <CardAction className="self-end max-sm:mt-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-3"
                style={{ opacity: LOW }}
              />
              <span className="text-sm text-muted-foreground">Least value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-3"
                style={{ opacity: HIGH }}
              />
              <span className="text-sm text-muted-foreground">Max value</span>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="relative grid min-h-0 flex-1 grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4">
          <div className="flex flex-col gap-0.5">
            {hours.map((hour) => (
              <span
                key={hour}
                className="flex flex-1 items-center justify-end text-xs text-muted-foreground"
              >
                {hour}
              </span>
            ))}
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-col gap-0.5">
            {rows.map((row, i) => (
              <div key={hours[i]} className="flex min-h-0 flex-1 gap-0.5">
                {row.map((value, j) => (
                  <div
                    key={days[j]}
                    aria-hidden="true"
                    className="min-w-0 flex-1 rounded-sm bg-chart-3 transition-opacity"
                    style={{ opacity: opacityFor(value) }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div aria-hidden="true" />

          <div className="flex gap-0.5">
            {days.map((day) => (
              <span
                key={day}
                className="min-w-0 flex-1 text-center text-xs text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        <table className="sr-only">
          <caption>Open rate by send time</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              {days.map((day) => (
                <th key={day} scope="col">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={hours[i]}>
                <th scope="row">{hours[i]}</th>
                {row.map((cell, j) => (
                  <td key={days[j]}>{cell}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
