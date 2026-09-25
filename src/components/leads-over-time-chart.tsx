"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import fixture from "@/data/leads-fixture.json"

const chartConfig = {
  previous: { label: "Previous", color: "var(--chart-1)" },
  current: { label: "Current", color: "var(--chart-2)" },
} satisfies ChartConfig

// The y scale is fixed, not data-derived: the reference's gridlines sit at
// 0/30/60/90/120 across a 192px plot, which is 1.6px per lead. Letting recharts
// pick the domain would stretch the curves to the top of the card.
const [yMin, yMax] = fixture.overTime.domain

export function LeadsOverTimeChart() {
  return (
    <Card className="h-90">
      <CardHeader>
        <CardTitle>Leads over time</CardTitle>
        <CardDescription>Leads this period vs previous period</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {fixture.overTime.total}
          </span>
          <span className="text-sm font-medium tabular-nums text-success">
            {fixture.overTime.delta}
          </span>
          <span className="text-sm text-muted-foreground">
            {fixture.overTime.note}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <AreaChart
            data={fixture.overTime.points}
            margin={{ top: 0, right: 12, bottom: 0, left: 12 }}
          >
            <defs>
              <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-previous)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-previous)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-current)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-current)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis hide domain={[yMin, yMax]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="previous"
              type="natural"
              fill="url(#fillPrevious)"
              fillOpacity={0.4}
              stroke="var(--color-previous)"
              strokeWidth={1}
            />
            <Area
              dataKey="current"
              type="natural"
              fill="url(#fillCurrent)"
              fillOpacity={0.4}
              stroke="var(--color-current)"
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
