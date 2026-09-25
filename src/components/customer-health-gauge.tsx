"use client"

import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import fixture from "@/data/customers-fixture.json"

const { healthScore, healthBands } = fixture

// Band dots reuse the same semantic tokens as the gauge arc.
const BAND_DOT = ["bg-success", "bg-warning", "bg-destructive"]

// The reference fills the value arc with var(--success) at a score of 86, i.e.
// the Healthy band. Deriving the token from the band keeps that correct if the
// score moves, rather than pinning green to every value.
function bandToken(score: number) {
  if (score >= 80) return "var(--success)"
  if (score >= 50) return "var(--warning)"
  return "var(--destructive)"
}

const chartConfig = {
  value: { label: "Health score" },
} satisfies ChartConfig

export function CustomerHealthGauge() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average customer health score</CardTitle>
        <CardDescription>
          Avg health score across active customers
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-10">
          {/* size-45 is 180px. The reference pins the gauge square, which is
              what overrides ChartContainer's default aspect-video. */}
          <ChartContainer config={chartConfig} className="size-45 shrink-0">
            <RadialBarChart
              data={[{ name: "score", value: healthScore }]}
              startAngle={220}
              endAngle={-40}
              innerRadius={72}
              outerRadius={88}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                fill={bandToken(healthScore)}
                background={{ fill: "var(--muted)" }}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    const { cx, cy } = (viewBox ?? {}) as {
                      cx?: number
                      cy?: number
                    }
                    if (cx == null || cy == null) return null
                    return (
                      <text x={cx} y={cy} textAnchor="middle">
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-2xl font-bold tracking-tight tabular-nums"
                        >
                          {healthScore}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Avg health score
                        </tspan>
                      </text>
                    )
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>

          <ul className="flex w-full max-w-48 flex-col gap-2.5">
            {healthBands.map(([label, range], i) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={`size-2 shrink-0 rounded-full ${BAND_DOT[i]}`}
                  />
                  <span className="truncate text-sm">{label}</span>
                </div>
                <span className="hidden shrink-0 text-sm font-medium tabular-nums sm:inline">
                  {range}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
