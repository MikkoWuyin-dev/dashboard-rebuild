"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import fixture from "@/data/campaigns-fixture.json"

const [spendCtl, cplCtl, rateCtl] = fixture.simulator.controls

// Derived from the reference's own starting figures: $100,000 at $29.50 gives
// 3,389 leads, 3.4% of those is 115 customers, and $483,000 of revenue is
// exactly 115 x 4,200. So revenue per customer is the one constant here.
const REVENUE_PER_CUSTOMER = 4200

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

export function GrowthSimulator() {
  const [spend, setSpend] = React.useState(spendCtl.value)
  const [cpl, setCpl] = React.useState(cplCtl.value)
  const [rate, setRate] = React.useState(rateCtl.value)

  const leads = Math.floor(spend / cpl)
  const customers = Math.floor((leads * rate) / 100)
  const revenue = customers * REVENUE_PER_CUSTOMER

  const rows = [
    {
      ...spendCtl,
      display: money(spend),
      current: spend,
      set: setSpend,
    },
    {
      ...cplCtl,
      display: `$${cpl.toFixed(2)}`,
      current: cpl,
      set: setCpl,
    },
    {
      ...rateCtl,
      display: `${rate.toFixed(1)}%`,
      current: rate,
      set: setRate,
    },
  ]

  const results = [
    { label: "Projected leads", value: leads.toLocaleString("en-US") },
    { label: "Projected customers", value: customers.toLocaleString("en-US") },
    { label: "Projected revenue", value: money(revenue) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth simulator</CardTitle>
        <CardDescription>
          Model monthly spend against projected pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-6">
        <div className="flex flex-col gap-6">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-2 pb-1">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`sim-${row.label}`} className="text-sm">
                  {row.label}
                </label>
                <Input
                  id={`sim-${row.label}`}
                  inputMode="decimal"
                  className="w-28 shrink-0 tabular-nums"
                  value={row.display}
                  readOnly
                />
              </div>
              <Slider
                aria-label={row.label}
                className="**:data-[slot=slider-range]:bg-chart-3"
                min={row.min}
                max={row.max}
                step={row.step}
                value={row.current}
                onValueChange={(next) =>
                  row.set(Array.isArray(next) ? next[0] : next)
                }
              />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {results.map((result) => (
            <div key={result.label} className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-xs text-muted-foreground">
                {result.label}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {result.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
