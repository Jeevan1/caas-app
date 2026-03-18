"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PaginatedAPIResponse } from "@/lib/types";
import { FOLLOW_QUERY_KEY } from "@/constants";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Follower = {
  idx: string;
  name: string;
  image: string | null;
};

type Organizer = {
  idx: string;
  name: string;
  image: string | null;
};

type OrganizerFollow = {
  idx: string;
  follower: Follower;
  organizer: Organizer;
};

// ─── SKELETON ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <tr className="border-b border-border">
      {[50, 40, 30].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 animate-pulse rounded-md bg-muted/70"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={3} className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              No organizers followed yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Organizers you follow will appear here.
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

function Avatar({ name, image }: { name: string; image: string | null }) {
  return image ? (
    <Image
      src={image}
      alt={name}
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground uppercase">
      {name.charAt(0)}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

const FollowedOrganizersOverview = () => {
  const { data, isLoading } = useApiQuery<
    PaginatedAPIResponse<OrganizerFollow>
  >({
    url: "/api/event/organizer-follows/",
    queryKey: FOLLOW_QUERY_KEY,
    queryParams: { page: 1, pageSize: 100 },
  });

  const follows = data?.results ?? [];
  const total = follows.length;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Followed Organizers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organizers you're following.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            All Followed Organizers
          </h3>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${total} organizer${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Organizer</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
              ) : follows.length === 0 ? (
                <EmptyState />
              ) : (
                follows.map((follow) => (
                  <tr
                    key={follow.idx}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    {/* Organizer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={follow.organizer.name}
                          image={follow.organizer.image}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {follow.organizer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Organizer
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FollowedOrganizersOverview;
