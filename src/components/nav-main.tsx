"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChartLine,
  House,
  Megaphone,
  Settings,
  SquareKanban,
  UserPlus,
  Users,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const navItems = [
  { title: "Overview", href: "/", icon: House },
  { title: "Analytics", href: "/analytics", icon: ChartLine },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Deals", href: "/deals", icon: SquareKanban },
  { title: "Leads", href: "/leads", icon: UserPlus },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
] as const

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
