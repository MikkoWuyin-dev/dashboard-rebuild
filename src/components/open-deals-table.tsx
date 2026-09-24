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
                  <TableCell>{owner}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        COLOURED_STAGES.has(stage) ? "success" : "secondary"
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
