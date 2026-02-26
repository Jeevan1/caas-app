"use client";

import Image from "next/image";
import { Globe, Loader2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrganizerFollow } from "@/hooks/Useorganizerfollow";

type OrganizerCardProps = {
  idx: string;
  name: string;
  image: string | null;
  // optional extra stats shown in the sidebar card
  stats?: [string, string][];
  // "inline" = compact row inside About tab
  // "sidebar" = full card in the right sidebar
  variant?: "inline" | "sidebar";
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
      {initials(name)}
    </div>
  );
}

function FollowButton({
  idx,
  compact = false,
}: {
  idx: string;
  compact?: boolean;
}) {
  const { isFollowing, toggle, isPending, isLoading } = useOrganizerFollow(idx);

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn(
          "shrink-0 rounded-full text-xs",
          compact ? "h-7 px-3" : "h-8 px-4",
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={toggle}
      className={cn(
        "shrink-0 rounded-full text-xs transition-all",
        compact ? "h-7 px-3" : "h-8 px-4",
        isFollowing && "text-secondary-foreground",
      )}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="mr-1 h-3 w-3" /> Following
        </>
      ) : (
        <>
          <UserPlus className="mr-1 h-3 w-3" /> Follow
        </>
      )}
    </Button>
  );
}

export function OrganizerCard({
  idx,
  name,
  image,
  stats,
  variant = "inline",
}: OrganizerCardProps) {
  if (variant === "sidebar") {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Organized by
        </p>
        <div className="flex items-center gap-3">
          <Avatar name={name} image={image} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3" /> Public group
            </p>
          </div>
          <FollowButton idx={idx} />
        </div>

        {stats && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {stats.map(([val, lbl]) => (
              <div key={lbl} className="rounded-lg bg-muted/60 py-2">
                <p className="text-sm font-bold text-foreground">{val}</p>
                <p className="text-[10px] text-muted-foreground">{lbl}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // inline (About tab)
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar name={name} image={image} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">Organizer</p>
      </div>
      <FollowButton idx={idx} compact />
    </div>
  );
}
