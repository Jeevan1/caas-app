"use client";

import { LayoutDashboard, LogOut, LogIn, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignOutAction } from "@/actions/signout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/types";

function Avatar({ user }: { user: User }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name ?? "User"}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-bold text-primary">
      {user.name?.charAt(0).toUpperCase() ?? "U"}
    </div>
  );
}

export default function UserMenu({
  user,
  onLogout,
  side = "bottom",
}: {
  user: User | null;
  onLogout?: () => void;
  side?: "top" | "bottom";
}) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogIn className="h-4 w-4" /> Log in
      </Link>
    );
  }

  const handleSignOut = async () => {
    await SignOutAction();
    onLogout?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted data-[state=open]:bg-muted outline-none"
        >
          <Avatar user={user} />
          <span className="text-sm font-medium text-foreground">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={side}
        align="end"
        sideOffset={8}
        className="z-[9999] w-52 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-lg"
      >
        <DropdownMenuLabel className="flex items-center gap-3 border-b border-border px-4 py-3 font-normal">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="text-[11px] text-muted-foreground">Member</p>
          </div>
        </DropdownMenuLabel>

        <div className="p-1.5">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
