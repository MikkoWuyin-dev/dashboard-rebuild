"use client"

import * as React from "react"
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  MoreHorizontal,
  Search,
} from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// The reference pins three columns inline; the rest are auto. Without these the
// grip and actions columns render narrow, shifting every other column 12-18px
// left and mismatching every cell in all ten rows.
// Only Name and MRR are sortable in the reference; the rest are plain text.
// Their headers are ghost buttons, which is also why those two columns render
// wider than a bare label.
const SORTABLE: Record<number, { key: "name" | "mrr"; align: "left" | "right" }> = {
  2: { key: "name", align: "left" },
  5: { key: "mrr", align: "right" },
}

const money = (v: string) => Number(v.replace(/[^0-9.]/g, ""))

const EDGE_PAD = (i: number, n: number) =>
  i === 0 ? "pl-4" : i === n - 1 ? "pr-4" : undefined

const COL_WIDTHS: (string | undefined)[] = [
  "1%",
  "1%",
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  "56px",
]

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
  const [sort, setSort] = React.useState<{
    key: "name" | "mrr"
    dir: "asc" | "desc"
  } | null>(null)

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q),
        )
      : rows
    if (!sort) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) =>
      sort.key === "mrr"
        ? (money(a.mrr) - money(b.mrr)) * dir
        : a.name.localeCompare(b.name) * dir,
    )
  }, [rows, query, sort])

  function toggleSort(key: "name" | "mrr") {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    )
  }

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
          <Button variant="outline">
            All customers
          </Button>
          <Button variant="outline">
            Comfortable
          </Button>
          <Button variant="outline">
            Columns
          </Button>
          <Button variant="outline">
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col, i) => (
                <TableHead
                  key={i}
                  style={{ width: COL_WIDTHS[i] }}
                  className={EDGE_PAD(i, COLUMNS.length)}
                >
                  {col === "Reorder" || col === "Actions" ? (
                    <span className="sr-only">{col}</span>
                  ) : col === "" ? (
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all customers"
                    />
                  ) : SORTABLE[i] ? (
                    <div
                      data-align={SORTABLE[i].align}
                      className="data-[align=right]:text-right"
                    >
                      <Button
                        variant="ghost"
                        data-align={SORTABLE[i].align}
                        onClick={() => toggleSort(SORTABLE[i].key)}
                        className="h-8 gap-1.5 px-2 data-[align=left]:-translate-x-2 data-[align=right]:translate-x-2"
                      >
                        {col}
                        <ArrowUpDown />
                      </Button>
                    </div>
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
                <TableCell className="pl-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-roledescription="sortable"
                    aria-label={`Drag to reorder ${row.name}`}
                    className="size-7 cursor-grab text-muted-foreground"
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
                <TableCell className="pr-4">
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open row actions"
                            className="size-7"
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

      {/* The reference paginates 16 rows at 10 per page; we hold page 1. Nav
          buttons are size-7, first/previous disabled on page 1. */}
      <div
        data-slot="data-table-pagination"
        className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          data-slot="data-table-pagination-info"
          className="text-sm text-muted-foreground max-sm:hidden"
        >
          {selected.size} of {fixture.totalRows} row(s) selected
        </p>
        <div
          data-slot="data-table-pagination-controls"
          className="flex flex-wrap items-center gap-3 max-sm:justify-between lg:gap-7"
        >
          <div
            data-slot="data-table-pagination-page-size"
            className="flex items-center gap-1.5 max-sm:hidden"
          >
            <span className="text-sm font-medium">Rows per page</span>
            <Select value={String(fixture.pageSize)}>
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div data-slot="data-table-pagination-page-info" className="text-sm">
            Page 1 of {Math.ceil(fixture.totalRows / fixture.pageSize)}
          </div>
          <div
            data-slot="data-table-pagination-buttons"
            className="flex items-center gap-1.5"
          >
            <Button variant="outline" size="icon" className="size-7" disabled aria-label="Go to first page">
              <ChevronsLeft />
            </Button>
            <Button variant="outline" size="icon" className="size-7" disabled aria-label="Go to previous page">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" className="size-7" aria-label="Go to next page">
              <ChevronRight />
            </Button>
            <Button variant="outline" size="icon" className="size-7" aria-label="Go to last page">
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
