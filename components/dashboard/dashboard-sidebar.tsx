"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  FileImage,
  Trophy,
  User,
  Settings,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard#campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard#analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard#templates", icon: FileImage, label: "Templates" },
  { href: "/dashboard#leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/dashboard#profile", icon: User, label: "Profile" },
  { href: "/dashboard#settings", icon: Settings, label: "Settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">CaaS</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="p-4">
          <div className="rounded-xl bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlock unlimited campaigns and premium templates.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
