import { AiInsights } from "@/components/ai-insights"
import { AttributionChart } from "@/components/attribution-chart"
import { LeadsOverTimeChart } from "@/components/leads-over-time-chart"
import { MarketingGoals } from "@/components/marketing-goals"
import { PipelineByStage } from "@/components/pipeline-by-stage"
import { RepLeaderboard } from "@/components/rep-leaderboard"
import { RevenueVsTarget } from "@/components/revenue-vs-target"
import { RootMetrics } from "@/components/root-metrics"

// Two columns from lg. Below lg the wrappers go display:contents, so all seven
// cards become siblings in one column and the order-* classes interleave them:
// leads, revenue, goals, pipeline, attribution, leaderboard, insights.
export default function Home() {
  return (
    <>
      <RootMetrics />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
          <div className="order-1">
            <LeadsOverTimeChart />
          </div>
          <div className="order-5">
            <AttributionChart />
          </div>
          <div className="order-7">
            <AiInsights />
          </div>
        </div>
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
          <div className="order-2">
            <RevenueVsTarget />
          </div>
          <div className="order-3">
            <MarketingGoals />
          </div>
          <div className="order-4">
            <PipelineByStage />
          </div>
          <div className="order-6">
            <RepLeaderboard />
          </div>
        </div>
      </div>
    </>
  )
}
