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
  leads: { label: "Leads", color: "var(--chart-1)" },
  clicks: { label: "Clicks", color: "var(--chart-2)" },
} satisfies ChartConfig

const [yMin, yMax] = fixture.channelPerformance.domain

// No barSize: the reference leaves recharts' defaults alone (10% category gap,
// 4px between the pair), which is why the bars are 39px at 1440 and 23px at
// 1024. Pinning a width would break the narrower viewports.
export function ChannelPerformanceChart() {
  return (
    <Card className="h-90">
      <CardHeader>
        <CardTitle>Channel performance</CardTitle>
        <CardDescription>
          Clicks received vs leads converted, by channel
        </CardDescription>
        <CardAction className="self-end">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full bg-chart-1" />
              <span className="text-sm text-muted-foreground">Leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full bg-chart-2" />
              <span className="text-sm text-muted-foreground">Clicks</span>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <BarChart data={fixture.channelPerformance.rows}>
            <defs>
              <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-2)" />
              </linearGradient>
              <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-4)" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="channel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis hide domain={[yMin, yMax]} />
            <Bar dataKey="leads" fill="url(#fillLeads)" radius={6} />
            <Bar dataKey="clicks" fill="url(#fillClicks)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
