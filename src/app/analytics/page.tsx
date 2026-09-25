import { AttributionChart } from "@/components/attribution-chart"
import { ChannelPerformanceChart } from "@/components/channel-performance-chart"
import { LeadsOverTimeChart } from "@/components/leads-over-time-chart"
import { MarketingFunnel } from "@/components/marketing-funnel"
import { TopLandingPages } from "@/components/top-landing-pages"
import { TrafficByChannel } from "@/components/traffic-by-channel"

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <TrafficByChannel />
        <ChannelPerformanceChart />
        <MarketingFunnel />
      </div>
      <div className="flex flex-col gap-4">
        <TopLandingPages />
        <LeadsOverTimeChart />
        <AttributionChart />
      </div>
    </div>
  )
}
