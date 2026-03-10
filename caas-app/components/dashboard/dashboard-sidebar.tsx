"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Megaphone,
  FileImage,
  Trophy,
  User,
  Settings,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/providers";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/categories", icon: Trophy, label: "Categories" },
  { href: "/dashboard/events", icon: Megaphone, label: "Events" },
  { href: "/joined-events", icon: FileImage, label: "Joined Events" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onLinkClick}
        className="flex items-center gap-2 border-b border-border px-6 py-5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">CaaS</span>
      </Link>

      <nav className="flex-1 px-4 py-4">
        <ul className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onLinkClick}
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

      <div className="p-4 md:mb-10">
        <div className="flex items-center gap-2 px-2">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-border bg-muted object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="fixed flex h-screen w-64 flex-col">
          <SidebarContent />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">CaaS</span>
        </Link>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <aside
            className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideIn 0.22s cubic-bezier(0.32,0.72,0,1) both",
            }}
          >
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1;   }
        }
      `}</style>
    </>
  );
}
