import { MetricStrip, type Metric } from "@/components/metric-strip"
import fixture from "@/data/root-fixture.json"

export function RootMetrics() {
  return <MetricStrip metrics={fixture.metrics as Metric[]} />
}
