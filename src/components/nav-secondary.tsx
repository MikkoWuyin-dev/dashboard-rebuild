"use client"

import { LifeBuoy, Search } from "lucide-react"

import { useCommandPalette } from "@/components/command-palette"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Get help", icon: LifeBuoy },
  { title: "Search", icon: Search },
] as const

export function NavSecondary() {
  const { setOpen } = useCommandPalette()
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            onClick={
              item.title === "Search" ? () => setOpen(true) : undefined
            }
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
