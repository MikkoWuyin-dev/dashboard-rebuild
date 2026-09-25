import { CampaignPerformanceTable } from "@/components/campaign-performance-table"
import { CostPerAcquisitionChart } from "@/components/cost-per-acquisition-chart"
import { EngagementHeatmap } from "@/components/engagement-heatmap"
import { GrowthSimulator } from "@/components/growth-simulator"
import { PaidMediaAllocation } from "@/components/paid-media-allocation"

export default function Campaigns() {
  return (
    <>
      <CampaignPerformanceTable />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PaidMediaAllocation />
        <EngagementHeatmap />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GrowthSimulator />
        <CostPerAcquisitionChart />
      </div>
    </>
  )
}
