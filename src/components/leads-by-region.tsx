"use client"

import * as React from "react"

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

// Flags and the world map are served from the target's own CDN rather than
// copied into this repo. The pin positions are percentages of the map image,
// read off the reference's own markers.
const FLAG = (slug: string) =>
  `https://assets.shadcncraft.com/registry/flags/${slug}.svg`
const MAP = "https://assets.shadcncraft.com/registry/map.svg"

export function LeadsByRegion() {
  const [view, setView] = React.useState<string[]>(["list"])
  const showing = view[0] ?? "list"

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
            value={view}
            onValueChange={(next) => setView(next.length ? next : [showing])}
            aria-label="Leads by region view"
          >
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="map">Map</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showing === "map" ? <RegionMap /> : <RegionTable />}
      </CardContent>
    </Card>
  )
}

function RegionTable() {
  return (
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
  )
}

function RegionMap() {
  return (
    <div className="relative aspect-21/9 w-full overflow-hidden rounded-xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-full object-cover" src={MAP} />
      {fixture.regions.map((region) => (
        <div
          key={region.country}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: region.left, top: region.top }}
        >
          <svg
            viewBox="0 0 38 38"
            fill="none"
            aria-hidden="true"
            className="size-9.5 text-primary"
          >
            <circle opacity="0.1" cx="19" cy="19" r="19" fill="currentColor" />
            <circle opacity="0.1" cx="19" cy="19" r="12" fill="currentColor" />
            <circle cx="19" cy="19" r="4" fill="currentColor" />
          </svg>
          <span className="sr-only">
            {region.country}: {region.leads} leads, {region.pipeline} pipeline
          </span>
        </div>
      ))}
    </div>
  )
}
