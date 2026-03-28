"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  Users,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { JOIN_REQUEST_QUERY_KEY } from "@/constants";
import { EventJoinRequest, PaginatedAPIResponse } from "@/lib/types";
import { ConfirmDialog } from "../ConfirmDialog";
import ImagePreview from "../ImagePreview";
import { useCurrentUser } from "@/lib/providers";
import { hasPermission } from "@/lib/permissions/has-permissions";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { CAN } from "@/lib/permissions/CAN";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type PaymentStatus = 0 | 1 | 2 | 3;

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; dot: string }
> = {
  0: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  1: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    dot: "bg-green-500",
  },
  2: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    dot: "bg-red-500",
  },
  3: {
    label: "Rejected",
    className:
      "bg-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-red-700",
    dot: "bg-red-500",
  },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Completed" },
  { value: "2", label: "Failed" },
  { value: "3", label: "Rejected" },
] as const;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  )
    pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  bg,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  bg: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          bg,
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
          </td>
          <td className="px-6 py-4">
            <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="h-7 w-20 rounded-full bg-muted animate-pulse" />
              <div className="h-7 w-16 rounded-full bg-muted animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {filtered ? (
            <>
              <Search className="h-8 w-8 text-muted-foreground/40" />
              <p>No requests match your filters.</p>
            </>
          ) : (
            <>
              <Users className="h-8 w-8 text-muted-foreground/40" />
              <p>No join requests yet.</p>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value]);
  return debouncedValue;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function JoinRequestOverview({ id }: { id: string }) {
  const user = useCurrentUser();
  const locale = useLocale();
  const perms = hasPermission(user, ["event_joins-list:get"]);

  if (!perms) redirect({ href: "/dashboard", locale });

  // ── Filter + page state ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "0" | "1" | "2" | "3"
  >("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const resetPage = () => setPage(1);

  const handleSearch = (v: string) => {
    setSearch(v);
    resetPage();
  };
  const handleStatus = (v: typeof statusFilter) => {
    setStatusFilter(v);
    resetPage();
  };
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    resetPage();
  };

  // ── Build query params ───────────────────────────────────────────────────
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(PAGE_SIZE));
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (statusFilter !== "all") params.set("payment_status", statusFilter);

  const queryClient = useQueryClient();
  const baseQueryKey = [...JOIN_REQUEST_QUERY_KEY, id];

  const { data, isLoading } = useApiQuery<
    PaginatedAPIResponse<EventJoinRequest>
  >({
    url: `/api/event/events/${id}/joins/?${params.toString()}`,
    queryKey: [
      ...JOIN_REQUEST_QUERY_KEY,
      id,
      page,
      debouncedSearch,
      statusFilter,
    ],
    enabled: !!user && perms,
  });

  // ── Separate stats (unfiltered totals) ───────────────────────────────────
  const { data: statsData } = useApiQuery<{
    total: number;
    pending: number;
    completed: number;
    rejected: number;
  }>({
    url: `/api/event/events/${id}/joins/stats/`,
    queryKey: [...JOIN_REQUEST_QUERY_KEY, id, "stats"],
    enabled: !!user && perms,
  });

  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = !!(debouncedSearch || statusFilter !== "all");

  // Fallback stats from current page if no dedicated stats endpoint
  const stats = statsData ?? {
    total: totalCount,
    pending: rows.filter((e) => e.payment_status === 0).length,
    completed: rows.filter((e) => e.payment_status === 1).length,
    rejected: rows.filter((e) => e.payment_status === 3).length,
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* ── Header ── */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Join Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve attendee requests for this event.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Users}
          bg="bg-primary/10"
          color="text-primary"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          bg="bg-amber-500/10"
          color="text-amber-500"
        />
        <StatCard
          label="Approved"
          value={stats.completed}
          icon={CheckCircle2}
          bg="bg-green-500/10"
          color="text-green-500"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          bg="bg-destructive/10"
          color="text-destructive"
        />
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header + filters */}
        <div className="border-b border-border px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                All Requests
              </h3>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Loading…"
                  : `${totalCount} request${totalCount !== 1 ? "s" : ""} ${hasFilters ? "found" : "total"}`}
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status segmented control */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              {STATUS_FILTER_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleStatus(s.value as any)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === s.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Attendee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment Proof</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : rows.length === 0 ? (
                <EmptyState filtered={hasFilters} />
              ) : (
                rows.map((ev) => {
                  const statusCfg =
                    STATUS_CONFIG[ev.payment_status as PaymentStatus] ??
                    STATUS_CONFIG[0];
                  const isPending = ev.payment_status === 0;
                  const isApproved = ev.payment_status === 1;
                  const isRejected = ev.payment_status === 3;

                  return (
                    <tr
                      key={ev.idx}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      {/* Attendee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ev.user.image ? (
                            <Image
                              src={ev.user.image}
                              alt={ev.user.name}
                              width={36}
                              height={36}
                              className="h-9 w-9 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                              {ev.user.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {ev.user.name}
                            </p>
                            {ev.user.email && (
                              <p className="text-xs text-muted-foreground">
                                {ev.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                            statusCfg.className,
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              statusCfg.dot,
                            )}
                          />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Payment proof */}
                      <td className="px-6 py-4">
                        {ev.payment_proof ? (
                          <ImagePreview
                            src={ev.payment_proof}
                            alt={ev.user.name}
                            className="h-9 w-9 rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                            <ImageIcon className="h-3.5 w-3.5" /> No proof
                          </div>
                        )}
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {ev.created_at
                          ? new Date(ev.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(isPending || isRejected) && (
                            <CAN permission={"event_joins-approve-join:post"}>
                              <ConfirmDialog
                                variant="custom"
                                method="POST"
                                url={`/api/event/events/${id}/joins/${ev.idx}/approve/`}
                                onSuccess={() =>
                                  queryClient.invalidateQueries({
                                    queryKey: baseQueryKey,
                                  })
                                }
                                itemName={ev.user.name}
                                icon={CheckCircle2}
                                title="Approve this request?"
                                description={
                                  <>
                                    Approving will allow{" "}
                                    <span className="font-semibold text-foreground">
                                      {ev.user.name}
                                    </span>{" "}
                                    to attend this event.
                                  </>
                                }
                                confirmLabel="Approve"
                                confirmClassName="h-8 gap-1.5 rounded-lg bg-green-600 px-3 text-xs text-white hover:bg-green-700"
                                iconClassName="text-green-600"
                                iconBgClassName="bg-green-50 dark:bg-green-950/40"
                                trigger={(open) => (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={open}
                                    className="h-7 gap-1 rounded-full px-3 text-xs"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                    Approve
                                  </Button>
                                )}
                              />
                            </CAN>
                          )}

                          {(isPending || isApproved) && (
                            <CAN permission={"event_joins-reject-join:post"}>
                              <ConfirmDialog
                                variant="custom"
                                method="POST"
                                url={`/api/event/events/${id}/joins/${ev.idx}/reject/`}
                                onSuccess={() =>
                                  queryClient.invalidateQueries({
                                    queryKey: baseQueryKey,
                                  })
                                }
                                itemName={ev.user.name}
                                icon={XCircle}
                                title="Reject this request?"
                                description={
                                  <>
                                    <span className="font-semibold text-foreground">
                                      {ev.user.name}
                                    </span>{" "}
                                    will be notified that their request was
                                    rejected.
                                  </>
                                }
                                confirmLabel="Reject"
                                confirmClassName="h-8 gap-1.5 rounded-lg bg-red-500 px-3 text-xs text-white hover:bg-red-600"
                                iconClassName="text-red-500"
                                iconBgClassName="bg-red-50 dark:bg-red-950/40"
                                trigger={(open) => (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={open}
                                    className="h-7 gap-1 rounded-full px-3 text-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                )}
                              />
                            </CAN>
                          )}

                          {isApproved && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {totalCount} total
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`e-${i}`}
                    className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      page === p
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
