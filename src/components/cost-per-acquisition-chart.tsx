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
import fixture from "@/data/campaigns-fixture.json"

const chartConfig = {
  cpa: { label: "Cost per lead", color: "var(--chart-2)" },
} satisfies ChartConfig

// Unlike the leads chart, this one's gridlines are not evenly spaced: the
// reference draws them at 0, 14.4442, 28.8878 and the domain top. Passing the
// ticks explicitly reproduces that instead of letting recharts pick its own.
const { domain, ticks } = fixture.cpa

export function CostPerAcquisitionChart() {
  return (
    <Card className="h-90">
      <CardHeader>
        <CardTitle>Cost per acquisition</CardTitle>
        <CardDescription>Average cost per lead daily</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {fixture.cpa.headline}
          </span>
          <span className="text-sm font-medium tabular-nums text-destructive">
            {fixture.cpa.delta}
          </span>
          <span className="text-sm text-muted-foreground">
            {fixture.cpa.note}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <AreaChart
            data={fixture.cpa.points}
            margin={{ top: 0, right: 12, bottom: 0, left: 12 }}
          >
            <defs>
              <linearGradient id="fillCpa" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cpa)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cpa)"
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
            <YAxis hide domain={domain} ticks={ticks} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="cpa"
              type="natural"
              fill="url(#fillCpa)"
              fillOpacity={0.4}
              stroke="var(--color-cpa)"
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
