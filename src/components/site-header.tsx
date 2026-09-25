"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronsUpDown,
  LayoutTemplate,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { navItems } from "@/components/nav-main"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  const current =
    navItems.find((item) => item.href === pathname) ?? navItems[0]

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
          <Button variant="outline">Today</Button>
          <Button variant="outline">Last 7 days</Button>
          <p aria-live="polite" className="truncate text-sm font-medium">
            Feb 04 - Feb 11 2024
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline">
            Filters
            <ChevronDown />
          </Button>
          <Button variant="outline">
            Customize
            <LayoutTemplate />
          </Button>
          {/* 32px here, unlike every other icon button in the shell, which is
              28px. Matches the reference; at 28 the whole right-hand header
              group lands 4px off on every route. */}
          <Button variant="ghost" size="icon">
            <Search />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 @3xl/header:hidden">
        <Button variant="ghost" size="icon-sm">
          <Search />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon-sm">
          <SlidersHorizontal />
          <span className="sr-only">Filters</span>
        </Button>
      </div>
      <div data-slot="dialog-header" className="sr-only flex flex-col gap-2">
        <h2 className="font-heading text-base leading-none font-medium">
          Search
        </h2>
        <p className="text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground">
          Jump to a page in the dashboard.
        </p>
      </div>
    </header>
  )
}
