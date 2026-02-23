"use client";

import { useState, useRef } from "react";
import { LayoutDashboard, LogOut, LogIn, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SignOutAction } from "@/actions/signout";

type User = {
  name?: string | null;
  image?: string | null;
};

function Avatar({ user }: { user: User }) {
  return (
    <img
      src={user.image ?? "/default-avatar.png"}
      alt={user.name ?? "User"}
      className="h-9 w-9 rounded-full border border-border object-cover"
    />
  );
}

// ─── MENU ITEM ────────────────────────────────────────────────────────────────

function MenuItem({
  href,
  onClick,
  icon: Icon,
  label,
  destructive = false,
}: {
  href?: string;
  onClick?: () => void;
  icon: any;
  label: string;
  destructive?: boolean;
}) {
  const base = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    destructive
      ? "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      : "text-foreground hover:bg-muted",
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={base}>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

// ─── USER MENU ────────────────────────────────────────────────────────────────

export default function UserMenu({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };
  const handleSignOut = async () => {
    await SignOutAction();
    onLogout?.();
  };

  // ── Logged out ──────────────────────────────────────────────────────────────
  if (!user) {
    return <MenuItem href="/login" icon={LogIn} label="Log in" />;
  }

  // ── Logged in ───────────────────────────────────────────────────────────────
  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger */}
      <button
        type="button"
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors",
          open ? "bg-muted" : "hover:bg-muted",
        )}
      >
        <Avatar user={user} />
        <span className="hidden text-sm font-medium text-foreground md:block">
          {user.name}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 md:block",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-1.5 w-52 origin-top-right",
          "overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
          "transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        {/* User info header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="text-[11px] text-muted-foreground">Member</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-1.5">
          <MenuItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
          />
          <div className="my-1 h-px bg-border/60" />
          <MenuItem
            icon={LogOut}
            label="Log out"
            destructive
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
}
