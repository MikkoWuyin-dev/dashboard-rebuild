import * as React from "react"
import { ArrowUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "cn"
import fixture from "@/data/leads-fixture.json"

// The reference wraps four metric cards in one outer card. Below lg each inner
// card keeps its own chrome in a 2x2 grid; from lg up the inner cards drop
// their background, padding and ring and become flex columns divided by
// vertical separators, so the group reads as a single strip.
export function LeadsMetrics() {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:gap-5">
          {fixture.metrics.map((metric, i) => (
            <React.Fragment key={metric.title}>
              {i > 0 ? (
                <Separator
                  orientation="vertical"
                  className="hidden lg:block"
                />
              ) : null}
              <Card className="min-w-0 flex-1 lg:rounded-none lg:bg-transparent lg:py-0 lg:ring-0">
                <CardContent className="lg:px-0">
                  <h3
                    data-slot="metric-card-title"
                    className="mb-1.5 truncate text-base font-medium"
                  >
                    {metric.title}
                  </h3>
                  <div data-slot="metric-card-value" className="mb-1.5">
                    <div
                      data-slot="metric-card-value-number"
                      className="text-2xl font-semibold tracking-tight tabular-nums"
                    >
                      {metric.value}
                    </div>
                  </div>
                  <p
                    data-slot="metric-card-delta"
                    className="truncate text-sm text-muted-foreground"
                  >
                    <span
                      data-slot="metric-card-delta-value"
                      className={cn(
                        "inline-flex items-center gap-0.5 align-middle font-medium [&_svg]:size-[1em]",
                        metric.tone === "success"
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      <ArrowUp />
                      {metric.delta}
                    </span>{" "}
                    {metric.note}
                  </p>
                </CardContent>
              </Card>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
