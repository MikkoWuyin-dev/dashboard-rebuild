import { AlertTriangle, Sparkles, Target, TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import fixture from "@/data/root-fixture.json"

const ICON = {
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  target: Target,
  sparkles: Sparkles,
} as const

export function AiInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI insights</CardTitle>
        <CardDescription>
          Alerts and opportunities across your funnel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-2">
          {fixture.insights.map((insight) => {
            const Icon = ICON[insight.icon as keyof typeof ICON]
            return (
              <Item key={insight.title} size="sm" className="items-start">
                <ItemMedia>
                  <Icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{insight.title}</ItemTitle>
                  <ItemDescription>{insight.body}</ItemDescription>
                </ItemContent>
              </Item>
            )
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
