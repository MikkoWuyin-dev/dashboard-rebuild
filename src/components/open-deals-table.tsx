import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import fixtures from "@/data/panel-fixtures.json"

type Panel = {
  title: string | null
  description: string | null
  table?: { columns: string[]; rows: string[][] }
}

const panel = (fixtures.deals as Panel[]).find((p) => p.title === "Open deals")!
const { columns, rows } = panel.table!

// Column widths are inline on the reference's <th> elements.
const WIDTHS = ["25%", "18.75%", "18.75%", "18.75%", "18.75%"]

// Only "Contract sent" carries colour in this table; Negotiation, Proposal
// and Qualified render as the default variant. Verified against the
// reference DOM, not assumed.
const COLOURED_STAGES = new Set(["Contract sent"])

// "Sarah Chen" -> "SC". The target shows a photo here; ours is a masked
// placeholder, so only the 24px box has to match.
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

// "Aug 15, 2026" -> "2026-08-15" for the <time datetime> attribute.
function isoDate(label: string) {
  const parsed = new Date(label + " UTC")
  return Number.isNaN(parsed.valueOf())
    ? undefined
    : parsed.toISOString().slice(0, 10)
}

export function OpenDealsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{panel.title}</CardTitle>
        <CardDescription>{panel.description}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={col} style={{ width: WIDTHS[i] }}>
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const [deal, owner, stage, value, close] = row
              return (
                <TableRow key={deal}>
                  <TableCell className="font-medium">{deal}</TableCell>
                  <TableCell>
                    <div
                      data-variant="default"
                      data-slot="profile-card"
                      className="group/profile-card flex flex-row items-center gap-x-1.5"
                    >
                      <span
                        data-slot="profile-card-avatar"
                        data-size="sm"
                        className="group/avatar relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                      >
                        <span className="text-[0.625rem] font-medium text-muted-foreground">
                          {initials(owner)}
                        </span>
                      </span>
                      <div
                        data-slot="profile-card-details"
                        className="flex flex-col"
                      >
                        <div
                          data-slot="profile-card-name"
                          className="flex items-center gap-1 text-sm font-medium"
                        >
                          {owner}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        COLOURED_STAGES.has(stage) ? "success" : "outline"
                      }
                    >
                      {stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{value}</TableCell>
                  <TableCell className="tabular-nums">
                    <time dateTime={isoDate(close)}>{close}</time>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
