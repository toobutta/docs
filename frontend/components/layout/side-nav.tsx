'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Map,
  Users,
  Bell,
  BarChart3,
  Settings,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Map",
    href: "/map",
    icon: Map,
  },
  {
    title: "Audiences",
    href: "/audiences",
    icon: Users,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background">
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary font-semibold"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlock unlimited properties and advanced features
          </p>
          <Button size="sm" className="mt-3 w-full">
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  )
}
