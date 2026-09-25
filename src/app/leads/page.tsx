import { LeadFunnelChart } from "@/components/lead-funnel-chart"
import { LeadsByRegion } from "@/components/leads-by-region"
import { LeadsMetrics } from "@/components/leads-metrics"
import { LeadsOverTimeChart } from "@/components/leads-over-time-chart"
import { RecentLeadsTable } from "@/components/recent-leads-table"

export default function Leads() {
  return (
    <>
      <LeadsMetrics />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadsOverTimeChart />
        <LeadFunnelChart />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <RecentLeadsTable />
        <LeadsByRegion />
      </div>
    </>
  )
}
