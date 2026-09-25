import { FunnelPanel, type FunnelStage } from "@/components/funnel-panel"
import fixture from "@/data/root-fixture.json"

export function PipelineByStage() {
  return (
    <FunnelPanel
      id="pipeline"
      title="Pipeline by stage"
      description="Open pipeline across all deals"
      stages={fixture.pipeline as FunnelStage[]}
      caption={(s) => `${s.label}: ${s.display} (${s.share} of total)`}
    />
  )
}
