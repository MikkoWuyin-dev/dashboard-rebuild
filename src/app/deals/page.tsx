import { DealsBoard } from "@/components/deals-board"
import { DealVelocity } from "@/components/deal-velocity"
import { OpenDealsTable } from "@/components/open-deals-table"
import { WinRateChart } from "@/components/win-rate-chart"

export default function DealsPage() {
  return (
    <>
      <DealsBoard />
      <OpenDealsTable />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DealVelocity />
        <WinRateChart />
      </div>
    </>
  )
}
