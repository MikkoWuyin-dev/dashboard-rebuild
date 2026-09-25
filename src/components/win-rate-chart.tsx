"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

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
import fixtures from "@/data/panel-fixtures.json"

type Panel = {
  title: string | null
  description: string | null
  chart?: { categories: string[]; series: { values: number[] }[] }
}

const panel = (fixtures.deals as Panel[]).find(
  (p) => p.title?.startsWith("Win rate") ?? false,
)!

// Values recovered from the reference's rendered bar geometry: widths divide
// exactly by 4.28 px per percentage point, giving 44 / 72 / 78 / 57.
const data = panel.chart!.categories.map((stage, i) => ({
  stage,
  value: panel.chart!.series[0].values[i],
}))

const chartConfig = {
  value: { label: "Conversion" },
} satisfies ChartConfig

export function WinRateChart() {
  return (
    <Card className="h-90">
      <CardHeader>
        <CardTitle>{panel.title}</CardTitle>
        <CardDescription>{panel.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            32%
          </span>
          <span className="text-sm font-medium tabular-nums text-success">
            +2.1%
          </span>
          <span className="text-sm text-muted-foreground">
            vs previous period
          </span>
        </div>

        {/* Without this the container keeps aspect-video and the plot height
            follows the card width: 299px at 1440, 183px at 390. The reference
            is 214px at every viewport. */}
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              {/* Horizontal ramp, chart-2 -> chart-1, exactly as the
                  reference defines #fillConversion. Tokens, never hex. */}
              <linearGradient id="fillConversion" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
            </defs>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="stage"
              width={100}
              tickLine={false}
              axisLine={false}
              tickMargin={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="value"
              fill="url(#fillConversion)"
              radius={6}
              barSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
