import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import fixture from "@/data/customers-fixture.json"

const { leaderboard } = fixture

// Each bar is normalised to that rep's OWN quota, which the reference places at
// 83.3333% of the track -- so the scale max is quota x 1.2. Verified against
// all five rows: 220/240 = 91.6667%, 160/252 = 63.4921%, 135/264 = 51.1364%.
const QUOTA_MARK = 100 / 1.2

function attainmentPct(attainedK: number, quotaK: number) {
  return Math.min(100, (attainedK / (quotaK * 1.2)) * 100)
}

export function RepLeaderboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales rep leaderboard</CardTitle>
        <CardDescription>Quota attainment this quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {leaderboard.map((rep) => {
            const pct = attainmentPct(rep.attainedK, rep.quotaK)
            const amounts = `$${rep.attainedK}K/$${rep.quotaK}K`
            return (
              <li key={rep.name} className="flex items-center gap-3.5">
                <span className="w-3 shrink-0 text-xl font-medium tracking-tight text-muted-foreground tabular-nums">
                  {rep.rank}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      data-slot="avatar"
                      data-size="sm"
                      className="group/avatar relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                    >
                      <span className="text-[0.625rem] font-medium text-muted-foreground">
                        {rep.initials}
                      </span>
                    </span>
                    <span className="truncate text-sm font-medium">
                      {rep.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="relative hidden w-40 sm:block">
                      <div
                        data-slot="progress"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        aria-valuetext={`$${rep.attainedK}K of $${rep.quotaK}K`}
                        aria-label={`${rep.name} quota attainment`}
                        className="flex flex-wrap gap-3 **:data-[slot=progress-indicator]:bg-chart-3"
                      >
                        <div
                          data-slot="progress-track"
                          className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted"
                        >
                          <div
                            data-slot="progress-indicator"
                            className="h-full bg-primary transition-all"
                            style={{ insetInlineStart: 0, height: "inherit", width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 border-l border-dashed border-muted-foreground"
                        style={{ left: `${QUOTA_MARK}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {amounts}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
