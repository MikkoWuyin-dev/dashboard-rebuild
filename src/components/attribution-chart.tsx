"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import fixture from "@/data/analytics-fixture.json"

const chartConfig = {
  firstTouch: { label: "First touch", color: "var(--chart-1)" },
  lastTouch: { label: "Last touch", color: "var(--chart-2)" },
} satisfies ChartConfig

const [xMin, xMax] = fixture.attribution.domain

// barSize 16 with barGap 5 is what puts the pair at y 8 and 29 inside each
// 53.2px band. With the default gap of 4 recharts rounds the pair's offset up
// and the first series lands a pixel low.

export function AttributionChart() {
  return (
    <Card className="h-90">
      {/* Below sm the reference drops the header grid for a plain column, so
          the description runs full width and the legend sits under it. */}
      <CardHeader className="max-sm:flex max-sm:flex-col">
        <CardTitle>Attribution breakdown</CardTitle>
        <CardDescription>
          Revenue credited by first touch vs last touch
        </CardDescription>
        <CardAction className="self-end pl-6 max-sm:mt-2 max-sm:pl-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full bg-chart-1" />
              <span className="text-sm text-muted-foreground">First touch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full bg-chart-2" />
              <span className="text-sm text-muted-foreground">Last touch</span>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <BarChart
            data={fixture.attribution.rows}
            layout="vertical"
            barSize={16}
            barGap={5}
            margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="fillFirstTouch" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
              <linearGradient id="fillLastTouch" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-4)" />
                <stop offset="100%" stopColor="var(--chart-2)" />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide domain={[xMin, xMax]} />
            <YAxis
              type="category"
              dataKey="channel"
              width={64}
              tickLine={false}
              axisLine={false}
            />
            <Bar
              dataKey="firstTouch"
              fill="url(#fillFirstTouch)"
              radius={6}
            />
            <Bar dataKey="lastTouch" fill="url(#fillLastTouch)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
