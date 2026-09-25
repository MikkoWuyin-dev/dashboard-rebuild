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
import fixture from "@/data/analytics-fixture.json"

function Split({ value, share }: { value: string; share: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex-1 text-right tabular-nums">{value}</span>
      <span className="w-8 text-muted-foreground tabular-nums">{share}</span>
    </div>
  )
}

export function TopLandingPages() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top landing pages</CardTitle>
        <CardDescription>Ranked by sessions this period</CardDescription>
        <CardAction>
          {/* Dead control: there is no all-pages view to open. */}
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="w-32 text-right">Sessions</TableHead>
              <TableHead className="w-32 text-right">Visitors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixture.landingPages.map((row) => (
              <TableRow key={row.page}>
                <TableCell className="font-medium">{row.page}</TableCell>
                <TableCell>
                  <Split value={row.sessions} share={row.sessionsShare} />
                </TableCell>
                <TableCell>
                  <Split value={row.visitors} share={row.visitorsShare} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
