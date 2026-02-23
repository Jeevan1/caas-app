"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  FileImage,
  Trophy,
  User,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/providers";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/categories", icon: Trophy, label: "Categories" },
  { href: "/dashboard/events", icon: Megaphone, label: "Events" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-border px-6 py-5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">CaaS</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 px-2">
            {user?.image ? (
              <Image
                src={user?.image ?? ""}
                alt={user?.name ?? ""}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-border bg-muted"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-semibold text-foreground">
              {user?.name}
            </span>
          </div>

          <div className="rounded-xl bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">
              Upgrade to Pro
            </p>
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
  );
}
