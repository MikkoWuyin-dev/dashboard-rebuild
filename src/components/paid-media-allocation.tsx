"use client"

import { Cell, Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "cn"
import fixture from "@/data/campaigns-fixture.json"

const chartConfig = { value: { label: "Spend" } } satisfies ChartConfig

const TOTAL = fixture.allocation.reduce((sum, s) => sum + s.value, 0)
const TOTAL_LABEL = `$${TOTAL.toLocaleString("en-US")}`

const FILL = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
const DOT = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

// A 4 degree pad between five slices leaves 340 degrees for the data, which is
// what puts the first slice's outer arc at 119.2 degrees in the reference.
export function PaidMediaAllocation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paid media allocation</CardTitle>
        <CardDescription>
          Spend distribution across your paid channels
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-16">
          <ChartContainer config={chartConfig} className="size-50 shrink-0">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={fixture.allocation}
                dataKey="value"
                nameKey="label"
                innerRadius={73}
                outerRadius={95}
                cornerRadius={10}
                paddingAngle={4}
                isAnimationActive={false}
              >
                {fixture.allocation.map((slice, i) => (
                  <Cell key={slice.label} fill={FILL[i]} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    const vb = (viewBox ?? {}) as { cx?: number; cy?: number }
                    const cx = vb.cx ?? 100
                    const cy = vb.cy ?? 100
                    return (
                      <text x={cx} y={cy} textAnchor="middle">
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-2xl font-bold tracking-tight tabular-nums"
                        >
                          {TOTAL_LABEL}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Paid media
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="flex w-full max-w-55 flex-col gap-2.5">
            {fixture.allocation.map((slice, i) => (
              <li
                key={slice.label}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", DOT[i])}
                  />
                  <span className="truncate text-sm">{slice.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
                  <span className="font-medium">{slice.amount}</span>
                  <span className="text-muted-foreground">{slice.share}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
