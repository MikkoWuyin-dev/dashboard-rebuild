"use client"

import {
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
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

// The reference fills the value arc with var(--success) at a score of 86, i.e.
// the Healthy band. Deriving the token from the band keeps that correct if the
// score moves, instead of pinning green to every value.
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
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        <ChartContainer config={chartConfig}>
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

        <dl className="flex flex-col gap-2">
          {healthBands.map(([label, range]) => (
            <div key={label} className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm tabular-nums">{range}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
