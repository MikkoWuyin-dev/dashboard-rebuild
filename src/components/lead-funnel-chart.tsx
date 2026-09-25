"use client"

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "cn"
import fixture from "@/data/leads-fixture.json"

const chartConfig = {
  value: { label: "Share" },
} satisfies ChartConfig

// Five concentric 8px rings with 3.6px between them, each sweeping value% of a
// full turn from 12 o'clock. Recharts lays index 0 innermost, so the fixture is
// stored inner-to-outer and the legend below reads it back in reverse.
const LEGEND = [...fixture.funnel].reverse()

// Written out as literals so Tailwind sees the class names: a bg-chart-* string
// that only ever exists inside a JSON fixture never reaches the generated CSS.
const DOT: Record<string, string> = {
  leads: "bg-chart-1",
  mqls: "bg-chart-2",
  sqls: "bg-chart-3",
  deals: "bg-chart-4",
  customers: "bg-chart-5",
}

export function LeadFunnelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead-to-customer funnel</CardTitle>
        <CardDescription>
          Lead to closed-won conversion, this quarter
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          <ChartContainer config={chartConfig} className="size-50 shrink-0">
            <RadialBarChart
              data={fixture.funnel}
              innerRadius={41}
              outerRadius={99}
              startAngle={90}
              endAngle={-270}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                barSize={8}
                cornerRadius={4}
                background={{ fill: "var(--muted)" }}
              />
            </RadialBarChart>
          </ChartContainer>
          <ul className="flex w-full max-w-55 flex-col gap-2.5">
            {LEGEND.map((stage) => (
              <li
                key={stage.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", DOT[stage.id])}
                  />
                  <span className="truncate text-sm">{stage.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
                  <span className="font-medium">{stage.count}</span>
                  <span className="text-muted-foreground">{stage.value}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
