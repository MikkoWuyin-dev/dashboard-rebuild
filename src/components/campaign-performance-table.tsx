import { Mail, Music2, MessageCircle, Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "cn"
import fixture from "@/data/campaigns-fixture.json"

// The reference marks each channel with that company's own logo. Those are
// trademarks, so this uses neutral lucide icons of the same 16px footprint.
const ICON = {
  search: Search,
  meta: MessageCircle,
  mail: Mail,
  tiktok: Music2,
} as const

const WIDTHS = ["21%", "15.8%", "15.8%", "15.8%", "15.8%", "15.8%"]

// 56x16, seven points nine apart, stretched to the box. The filled area reuses
// the line's own points and closes along the bottom edge.
const SPARK_X = [1, 10, 19, 28, 37, 46, 55]

function Sparkline({ ys, tone }: { ys: number[]; tone: string }) {
  const points = SPARK_X.map((x, i) => `${x.toFixed(2)},${ys[i].toFixed(2)}`)
  return (
    <svg
      aria-hidden="true"
      className={cn("h-4 w-14 shrink-0", tone)}
      viewBox="0 0 56 16"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sparkline-${ys.join("-")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="20%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        opacity="0.25"
        fill={`url(#sparkline-${ys.join("-")})`}
        points={`${points.join(" ")} 56,16 0,16`}
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  )
}

export function CampaignPerformanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign performance</CardTitle>
        <CardDescription>Top 5 campaigns by leads generated</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {["Campaign", "Channel", "Spend", "Clicks", "Leads", "Cost per lead"].map(
                (col, i) => (
                  <TableHead key={col} style={{ width: WIDTHS[i] }}>
                    {col}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixture.campaigns.map((row) => {
              const Icon = ICON[row.icon as keyof typeof ICON]
              return (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Item size="xs" className="flex-nowrap p-0">
                      <ItemMedia>
                        <Icon className="size-4" />
                      </ItemMedia>
                      <ItemContent>{row.channel}</ItemContent>
                    </Item>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.spend}</TableCell>
                  <TableCell className="tabular-nums">{row.clicks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">{row.leads}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {row.delta}
                      </span>
                      <Sparkline ys={row.spark} tone={row.tone} />
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.cpl}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
