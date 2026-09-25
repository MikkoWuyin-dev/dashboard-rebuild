"use client"

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import fixture from "@/data/leads-fixture.json"

// Flags are served from the target's own CDN rather than copied into this repo.
// The Map view is not built; the toggle holds List.
const FLAG = (slug: string) =>
  `https://assets.shadcncraft.com/registry/flags/${slug}.svg`

export function LeadsByRegion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by region</CardTitle>
        <CardDescription>
          Where new leads come from and what they are worth
        </CardDescription>
        <CardAction>
          <ToggleGroup
            variant="outline"
            spacing={2}
            defaultValue={["list"]}
            aria-label="Leads by region view"
          >
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="map">Map</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead className="w-32 text-right">Leads</TableHead>
              <TableHead className="w-32 text-right">Pipeline value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixture.regions.map((region) => (
              <TableRow key={region.country}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="size-4 shrink-0 rounded-full"
                      src={FLAG(region.slug)}
                    />
                    {region.country}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="flex-1 text-right tabular-nums">
                      {region.leads}
                    </span>
                    <span className="w-8 text-muted-foreground tabular-nums">
                      {region.share}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {region.pipeline}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
