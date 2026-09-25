import { FunnelPanel, type FunnelStage } from "@/components/funnel-panel"
import fixture from "@/data/analytics-fixture.json"

export function MarketingFunnel() {
  return (
    <FunnelPanel
      id="marketing"
      title="Marketing funnel"
      description="Stage-by-stage conversion across your funnel"
      stages={fixture.funnel as FunnelStage[]}
      caption={(s) => `${s.label}: ${s.display} (${s.share} of total)`}
    />
  )
}
