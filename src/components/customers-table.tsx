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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { cn } from "cn"
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

// Columns the Columns menu can hide. Reorder, the checkbox, Name and Actions
// are not offered there in the reference, so they are always on.
const TOGGLEABLE = ["Email", "Plan", "MRR", "Health", "Created"] as const
type Toggleable = (typeof TOGGLEABLE)[number]

const PLANS = ["All customers", "Enterprise", "Team", "Pro", "Free"] as const
const DENSITIES = ["Comfortable", "Compact"] as const

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
const healthVariant: Record<string, "success" | "warning" | "destructive"> = {
  Healthy: "success",
  "At risk": "warning",
  Critical: "destructive",
}

const PAGE_SIZES = [10, 20, 50]

export function CustomersTable() {
  const [order, setOrder] = React.useState<Row[]>(fixture.table as Row[])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")
  const [plan, setPlan] = React.useState<(typeof PLANS)[number]>("All customers")
  const [density, setDensity] = React.useState<(typeof DENSITIES)[number]>("Comfortable")
  const [hidden, setHidden] = React.useState<Set<Toggleable>>(new Set())
  const [pageSize, setPageSize] = React.useState(fixture.pageSize)
  const [page, setPage] = React.useState(1)
  const [sort, setSort] = React.useState<{
    key: "name" | "mrr"
    dir: "asc" | "desc"
  } | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [details, setDetails] = React.useState<Row | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = order
    if (plan !== "All customers") rows = rows.filter((r) => r.plan === plan)
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
      )
    }
    if (!sort) return rows
    const dir = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) =>
      sort.key === "mrr"
        ? (money(a.mrr) - money(b.mrr)) * dir
        : a.name.localeCompare(b.name) * dir,
    )
  }, [order, query, plan, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pageCount)
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize)

  // Any change to what is being listed sends you back to the first page;
  // otherwise filtering down to four rows leaves you on an empty page 2.
  React.useEffect(() => {
    setPage(1)
  }, [query, plan, pageSize, sort])

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

  function isHidden(col: string) {
    return hidden.has(col as Toggleable)
  }

  function toggleColumn(col: Toggleable) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  // Dropping a row moves it in the master order, not in the filtered view, so
  // a reorder made while filtered survives clearing the filter.
  function dropOn(target: string) {
    if (!dragging || dragging === target) return
    setOrder((prev) => {
      const next = [...prev]
      const from = next.findIndex((r) => r.name === dragging)
      const to = next.findIndex((r) => r.name === target)
      if (from < 0 || to < 0) return prev
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }

  function exportCsv() {
    const cols = COLUMNS.filter(
      (c) => c && c !== "Reorder" && c !== "Actions" && !isHidden(c),
    ) as string[]
    const cell = (row: Row, col: string) =>
      ({
        Name: row.name,
        Email: row.email,
        Plan: row.plan,
        MRR: row.mrr,
        Health: row.health,
        Created: row.created,
      })[col] ?? ""
    const csv = [
      cols.join(","),
      ...filtered.map((r) =>
        cols.map((c) => `"${cell(r, c).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "customers.csv"
    a.click()
    URL.revokeObjectURL(url)
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
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              {plan}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={plan}
                onValueChange={(v) => setPlan(v as (typeof PLANS)[number])}
              >
                {PLANS.map((p) => (
                  <DropdownMenuRadioItem key={p} value={p}>
                    {p}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              {density}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={density}
                onValueChange={(v) =>
                  setDensity(v as (typeof DENSITIES)[number])
                }
              >
                {DENSITIES.map((d) => (
                  <DropdownMenuRadioItem key={d} value={d}>
                    {d}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TOGGLEABLE.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={!hidden.has(col)}
                  onCheckedChange={() => toggleColumn(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={exportCsv}>
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        {/* Compact is a single class on the table in the reference: the cells
            keep p-2 and the vertical padding is overridden to 2px. */}
        <Table className={cn(density === "Compact" && "[&_td]:py-0.5")}>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col, i) =>
                isHidden(col) ? null : (
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
                        className="mr-1"
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
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow
                key={row.name}
                data-state={selected.has(row.name) ? "selected" : undefined}
                data-dragging={dragging === row.name}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  dropOn(row.name)
                  setDragging(null)
                }}
                className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
              >
                <TableCell className="pl-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    draggable
                    onDragStart={() => setDragging(row.name)}
                    onDragEnd={() => setDragging(null)}
                    aria-roledescription="sortable"
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                  >
                    <span className="sr-only">Drag to reorder</span>
                    <GripVertical />
                  </Button>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.name)}
                    onCheckedChange={() => toggle(row.name)}
                    aria-label={`Select ${row.name}`}
                    className="mr-1"
                  />
                </TableCell>
                <TableCell>{row.name}</TableCell>
                {isHidden("Email") ? null : <TableCell>{row.email}</TableCell>}
                {isHidden("Plan") ? null : (
                  <TableCell>
                    <Badge variant="outline">{row.plan}</Badge>
                  </TableCell>
                )}
                {isHidden("MRR") ? null : (
                  <TableCell>
                    <div className="text-right tabular-nums">{row.mrr}</div>
                  </TableCell>
                )}
                {isHidden("Health") ? null : (
                  <TableCell>
                    <Badge variant={healthVariant[row.health] ?? "outline"}>
                      {row.health}
                    </Badge>
                  </TableCell>
                )}
                {isHidden("Created") ? null : (
                  <TableCell>{row.created}</TableCell>
                )}
                <TableCell className="pr-4">
                  <div className="text-right">
                    <RowActions
                      row={row}
                      onView={() => setDetails(row)}
                      onDelete={() =>
                        setOrder((prev) =>
                          prev.filter((r) => r.name !== row.name),
                        )
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div
        data-slot="data-table-pagination"
        className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          data-slot="data-table-pagination-info"
          className="text-sm text-muted-foreground max-sm:hidden"
        >
          {selected.size} of {fixture.table.length} row(s) selected
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
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div data-slot="data-table-pagination-page-info" className="text-sm">
            Page {current} of {pageCount}
          </div>
          <div
            data-slot="data-table-pagination-buttons"
            className="flex items-center gap-1.5"
          >
            <PageButton
              label="Go to first page"
              disabled={current === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft />
            </PageButton>
            <PageButton
              label="Go to previous page"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft />
            </PageButton>
            <PageButton
              label="Go to next page"
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight />
            </PageButton>
            <PageButton
              label="Go to last page"
              disabled={current === pageCount}
              onClick={() => setPage(pageCount)}
            >
              <ChevronsRight />
            </PageButton>
          </div>
        </div>
      </div>

      <CustomerDetails row={details} onClose={() => setDetails(null)} />
    </section>
  )
}

// The reference labels these with an sr-only span rather than aria-label, and
// tags each one data-table-pagination-button.
function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      data-slot="data-table-pagination-button"
      variant="outline"
      size="icon-sm"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sr-only">{label}</span>
      {children}
    </Button>
  )
}

function RowActions({
  row,
  onView,
  onDelete,
}: {
  row: Row
  onView: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <span className="sr-only">Open row actions</span>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>View customer</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void navigator.clipboard?.writeText(row.email)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? "Copied" : "Copy email"}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Delete customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// There is no customer page to route to, so "View customer" shows what the
// row holds rather than pretending to navigate somewhere.
function CustomerDetails({
  row,
  onClose,
}: {
  row: Row | null
  onClose: () => void
}) {
  return (
    <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{row?.name}</DialogTitle>
          <DialogDescription>{row?.email}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Plan", row?.plan],
            ["MRR", row?.mrr],
            ["Health", row?.health],
            ["Customer since", row?.created],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
