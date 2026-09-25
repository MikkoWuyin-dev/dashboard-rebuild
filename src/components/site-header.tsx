"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronsUpDown,
  LayoutTemplate,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useTheme } from "next-themes"

import { CommandPalette, useCommandPalette } from "@/components/command-palette"
import { navItems } from "@/components/nav-main"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

// The dashboard's data is a fixed snapshot, so the ranges are fixed labels
// rather than something computed from today's date -- computing them would
// make the header read differently every day and drift from the reference.
// "7d" is the default because that is what the reference renders.
const RANGES = {
  today: "Feb 11 2024",
  "7d": "Feb 04 - Feb 11 2024",
  "30d": "Jan 12 - Feb 11 2024",
  quarter: "Jan 01 - Feb 11 2024",
} as const

type RangeKey = keyof typeof RANGES

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  quarter: "This quarter",
}

export function SiteHeader() {
  const pathname = usePathname()
  const current =
    navItems.find((item) => item.href === pathname) ?? navItems[0]
  const { setOpen: setPaletteOpen } = useCommandPalette()
  const [range, setRange] = React.useState<RangeKey>("7d")
  const [customizeOpen, setCustomizeOpen] = React.useState(false)

  return (
    <header className="@container/header flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-6 data-[orientation=vertical]:self-center"
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
          {current.title}
          <ChevronsUpDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-1 items-center justify-between gap-2 @max-3xl/header:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRange("today")}>
            Today
          </Button>
          <Button variant="outline" onClick={() => setRange("7d")}>
            Last 7 days
          </Button>
          <p aria-live="polite" className="truncate text-sm font-medium">
            {RANGES[range]}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {/* Filters drives the same range the two buttons do, so the header
              has one piece of state and three ways into it, rather than a
              menu that changes nothing. */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Filters
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Period</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={range}
                onValueChange={(value) => setRange(value as RangeKey)}
              >
                {(Object.keys(RANGES) as RangeKey[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {RANGE_LABELS[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* A plain button, not a popover trigger: the reference's Customize
              carries data-slot="button", so the dialog is opened from state
              rather than by wrapping the button in a trigger. */}
          <Button variant="outline" onClick={() => setCustomizeOpen(true)}>
            Customize
            <LayoutTemplate />
          </Button>
          {/* 32px here, unlike every other icon button in the shell, which is
              28px. Matches the reference; at 28 the whole right-hand header
              group lands 4px off on every route. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaletteOpen(true)}
          >
            <Search />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 @3xl/header:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPaletteOpen(true)}
        >
          <Search />
          <span className="sr-only">Search</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <SlidersHorizontal />
            <span className="sr-only">Filters</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Period</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={range}
              onValueChange={(value) => setRange(value as RangeKey)}
            >
              {(Object.keys(RANGES) as RangeKey[]).map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {RANGE_LABELS[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCustomizeOpen(true)}>
              Customize
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CustomizeDialog open={customizeOpen} onOpenChange={setCustomizeOpen} />
      <CommandPalette />
    </header>
  )
}

function CustomizeDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { theme, setTheme } = useTheme()
  const sidebar = useSidebar()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Customize</DialogTitle>
          <DialogDescription>
            Display settings for this dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  aria-pressed={theme === option}
                  onClick={() => setTheme(option)}
                  className="flex-1 capitalize aria-pressed:bg-muted"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="customize-sidebar">Expanded sidebar</Label>
            <Switch
              id="customize-sidebar"
              checked={sidebar.state === "expanded"}
              onCheckedChange={() => sidebar.toggleSidebar()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
