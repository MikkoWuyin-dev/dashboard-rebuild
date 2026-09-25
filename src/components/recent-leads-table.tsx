"use client"

import { ChevronDown, GripVertical, MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import fixture from "@/data/leads-fixture.json"

const COLUMNS = [
  "Reorder",
  "Company",
  "Status",
  "About",
  "Owners",
  "Lead score",
  "Actions",
] as const

const COL_WIDTHS: (string | undefined)[] = [
  "1%",
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  "56px",
]

// The reference puts the edge padding on every cell with first:/last: variants.
// Applying it to just the first and last cells is the same thing, and keeps the
// shared table component untouched -- /deals uses a table without it.
const EDGE_PAD = (i: number, n: number) =>
  i === 0 ? "pl-4" : i === n - 1 ? "pr-4" : undefined

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

export function RecentLeadsTable() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-xl font-semibold">Recent leads</h2>
          <p className="text-sm text-muted-foreground">
            Newest leads added across all channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Status
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All statuses</DropdownMenuItem>
              <DropdownMenuItem>New</DropdownMenuItem>
              <DropdownMenuItem>Working</DropdownMenuItem>
              <DropdownMenuItem>Lost</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col, i) => (
                <TableHead
                  key={col}
                  style={{ width: COL_WIDTHS[i] }}
                  className={EDGE_PAD(i, COLUMNS.length)}
                >
                  {col === "Reorder" || col === "Actions" ? (
                    <span className="sr-only">{col}</span>
                  ) : (
                    col
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixture.recent.map((lead) => (
              <TableRow key={lead.company}>
                <TableCell className="pl-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-roledescription="sortable"
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                  >
                    <span className="sr-only">Drag to reorder</span>
                    <GripVertical />
                  </Button>
                </TableCell>

                <TableCell>
                  <Item size="xs" className="flex-nowrap p-0">
                    <ItemMedia className="self-center">
                      <Avatar>
                        <AvatarFallback>
                          {lead.company.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-0">
                      <ItemTitle>{lead.company}</ItemTitle>
                      <ItemDescription>{lead.domain}</ItemDescription>
                    </ItemContent>
                  </Item>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      lead.statusVariant as "secondary" | "destructive"
                    }
                  >
                    {lead.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Item className="p-0">
                    <ItemContent className="gap-0">
                      <ItemTitle>{lead.about}</ItemTitle>
                      <ItemDescription>{lead.aboutNote}</ItemDescription>
                    </ItemContent>
                  </Item>
                </TableCell>

                <TableCell>
                  <AvatarGroup>
                    {lead.owners.map((owner) => (
                      <Avatar key={owner}>
                        <AvatarFallback>{initials(owner)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={lead.score}
                      className="min-w-16"
                      aria-label={`Lead score for ${lead.company}`}
                    />
                    <span className="min-w-10 text-sm tabular-nums">
                      {lead.score}%
                    </span>
                  </div>
                </TableCell>

                <TableCell className="pr-4">
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" />
                        }
                      >
                        <span className="sr-only">Open row actions</span>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View lead</DropdownMenuItem>
                        <DropdownMenuItem>Assign owner</DropdownMenuItem>
                        <DropdownMenuItem>Mark as lost</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
