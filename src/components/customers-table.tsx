"use client"

import * as React from "react"
import { GripVertical, MoreHorizontal, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import fixture from "@/data/customers-fixture.json"

type Row = (typeof fixture.table)[number]

const COLUMNS = [
  "Reorder",
  "",
  "Name",
  "Email",
  "Plan",
  "MRR",
  "Health",
  "Created",
  "Actions",
] as const

// Health maps to the reference's own badge variants; Plan is always outline.
// Verified against reference/customers-light-1440.html.
const healthVariant: Record<string, "success" | "warning" | "destructive"> = {
  Healthy: "success",
  "At risk": "warning",
  Critical: "destructive",
}

export function CustomersTable() {
  const rows = fixture.table as Row[]
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
    )
  }, [rows, query])

  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selected.has(r.name))

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        for (const r of visible) next.delete(r.name)
        return next
      }
      return new Set([...prev, ...visible.map((r) => r.name)])
    })
  }

  return (
    <section className="relative flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div
          data-slot="input-group"
          role="group"
          className="group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none sm:max-w-xs"
        >
          <div className="flex h-auto cursor-text items-center justify-center gap-2 py-1.5 pl-2.5 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
            <Search />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers"
            aria-label="Search customers"
            className="h-8 w-full min-w-0 border-0 bg-transparent px-2.5 py-1 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            All customers
          </Button>
          <Button variant="outline" size="sm">
            Comfortable
          </Button>
          <Button variant="outline" size="sm">
            Columns
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col, i) => (
                <TableHead key={i}>
                  {col === "Reorder" || col === "Actions" ? (
                    <span className="sr-only">{col}</span>
                  ) : col === "" ? (
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all customers"
                    />
                  ) : (
                    col
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.name} data-state={selected.has(row.name) ? "selected" : undefined}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-roledescription="sortable"
                    aria-label={`Drag to reorder ${row.name}`}
                    className="cursor-grab text-muted-foreground"
                  >
                    <GripVertical />
                  </Button>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.name)}
                    onCheckedChange={() => toggle(row.name)}
                    aria-label={`Select ${row.name}`}
                  />
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.plan}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-right tabular-nums">{row.mrr}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={healthVariant[row.health] ?? "outline"}>
                    {row.health}
                  </Badge>
                </TableCell>
                <TableCell>{row.created}</TableCell>
                <TableCell>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open row actions"
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>Edit plan</DropdownMenuItem>
                        <DropdownMenuItem>Copy email</DropdownMenuItem>
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
