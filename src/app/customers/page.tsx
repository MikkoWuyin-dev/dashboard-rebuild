import { CustomerHealthGauge } from "@/components/customer-health-gauge"
import { CustomersTable } from "@/components/customers-table"
import { RepLeaderboard } from "@/components/rep-leaderboard"

export default function CustomersPage() {
  return (
    <>
      {/* The reference reorders these on mobile: the table comes first at
          narrow widths, the two cards first from lg up. */}
      <div className="order-2 grid grid-cols-1 gap-4 lg:order-1 lg:grid-cols-2">
        <CustomerHealthGauge />
        <RepLeaderboard />
      </div>
      <div className="order-1 lg:order-2">
        <CustomersTable />
      </div>
    </>
  )
}
