import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import fixtures from "@/data/panel-fixtures.json"

type Panel = {
  title: string | null
  description: string | null
  table?: { columns: string[]; rows: string[][] }
}

const panel = (fixtures.deals as Panel[]).find(
  (p) => p.title === "Deal velocity",
)!
const { columns, rows } = panel.table!

const stages = columns.slice(1) // Lead, Qualified, Proposal, Negotiation
const segments = rows.map((r) => r[0])

// Cell values are "<n> days"; the grid encodes them as opacity on bg-chart-3.
const days = rows.map((r) => r.slice(1).map((c) => parseInt(c, 10)))
const flat = days.flat()
const min = Math.min(...flat)
const max = Math.max(...flat)

// The reference scales opacity linearly from 0.1 at the fastest stage to 0.95
// at the slowest. Verified: 10 days -> 0.237838, 14 -> 0.32973, 17 -> 0.398649
// against min 4 and max 41.
function opacityFor(value: number) {
  return 0.1 + (0.85 * (value - min)) / (max - min)
}

export function DealVelocity() {
  return (
    <Card className="h-90">
      <CardHeader className="max-sm:flex max-sm:flex-col">
        <CardTitle>{panel.title}</CardTitle>
        <CardDescription>{panel.description}</CardDescription>
        <CardAction className="self-end max-sm:mt-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-3"
                style={{ opacity: 0.18 }}
              />
              <span className="text-sm text-muted-foreground">Faster</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-3"
                style={{ opacity: 0.95 }}
              />
              <span className="text-sm text-muted-foreground">Slower</span>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="relative grid min-h-0 flex-1 grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4">
          <div className="flex flex-col gap-0.5">
            {segments.map((segment) => (
              <span
                key={segment}
                className="flex flex-1 items-center justify-end text-xs text-muted-foreground"
              >
                {segment}
              </span>
            ))}
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-col gap-0.5">
            {days.map((row, i) => (
              <div key={segments[i]} className="flex min-h-0 flex-1 gap-0.5">
                {row.map((value, j) => (
                  <div
                    key={stages[j]}
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
            {stages.map((stage) => (
              <span
                key={stage}
                title={stage}
                className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground"
              >
                {stage}
              </span>
            ))}
          </div>
        </div>

        <table className="sr-only">
          <caption>Average days in stage by segment</caption>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                {row.slice(1).map((cell, j) => (
                  <td key={stages[j]}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
