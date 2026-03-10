"use client";

import {
  Calendar,
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Plus,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "@/i18n/navigation";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PaginatedAPIResponse, Event } from "@/lib/types";
import { EVENTS_QUERY_KEY } from "@/constants";
import { RecentEventsTable } from "./recent-events-table";
import { useMemo } from "react";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function getStatus(start: string, end: string) {
  const now = Date.now();
  if (now < new Date(start).getTime()) return "upcoming";
  if (now > new Date(end).getTime()) return "ended";
  return "live";
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-2 pt-0.5">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-12 animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  );
}

function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} w-full animate-pulse rounded-xl bg-muted/50`} />
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-foreground">
            {fmtNum(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function DashboardOverview() {
  // Fetch all events for chart/stat derivation (larger limit)
  const { data: allEventsData, isLoading: isLoadingAll } = useApiQuery<
    PaginatedAPIResponse<Event>
  >({
    url: `/api/event/events/my-events/`,
    queryKey: [...EVENTS_QUERY_KEY, "all"],
    queryParams: { limit: 100, page: 1 },
  });

  const events = allEventsData?.results ?? [];

  // ── Derived stats ───────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalAttendees = events.reduce(
      (s, e) => s + (e.total_attendees ?? 0),
      0,
    );
    const totalViews = events.reduce(
      (s, e) => s + ((e as any).total_views ?? 0),
      0,
    );
    const totalClicks = events.reduce(
      (s, e) => s + ((e as any).total_clicks ?? 0),
      0,
    );
    const paidRevenue = events
      .filter((e) => e.is_paid)
      .reduce((s, e) => s + (e.price ?? 0) * (e.total_attendees ?? 0), 0);

    const liveCount = events.filter(
      (e) => getStatus(e.start_datetime, e.end_datetime) === "live",
    ).length;

    return [
      {
        label: "Total Events",
        value: fmtNum(totalEvents),
        sub: `${liveCount} live now`,
        icon: Calendar,
        color: "text-primary",
        bg: "bg-primary/10",
        trend: liveCount > 0,
      },
      {
        label: "Total Views",
        value: fmtNum(totalViews),
        sub: "all time",
        icon: Eye,
        color: "text-secondary",
        bg: "bg-secondary/10",
        trend: totalViews > 0,
      },
      {
        label: "Total Clicks",
        value: fmtNum(totalClicks),
        sub: "all time",
        icon: MousePointerClick,
        color: "text-accent",
        bg: "bg-accent/10",
        trend: totalClicks > 0,
      },
      {
        label: "Attendees",
        value: fmtNum(totalAttendees),
        sub: `NPR ${fmtNum(paidRevenue)} revenue`,
        icon: Users,
        color: "text-primary",
        bg: "bg-primary/10",
        trend: totalAttendees > 0,
      },
    ];
  }, [events]);

  // ── Monthly bar chart data ───────────────────────────────────────────────

  const monthlyData = useMemo(() => {
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const map: Record<
      number,
      { views: number; clicks: number; attendees: number }
    > = {};

    events.forEach((e) => {
      const m = new Date(e.start_datetime).getMonth();
      if (!map[m]) map[m] = { views: 0, clicks: 0, attendees: 0 };
      map[m].views += (e as any).total_views ?? 0;
      map[m].clicks += (e as any).total_clicks ?? 0;
      map[m].attendees += e.total_attendees ?? 0;
    });

    // Show only months that have data, min 6 months
    const keys = Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b);
    const range =
      keys.length >= 6 ? keys : Array.from({ length: 12 }, (_, i) => i);

    return range.map((m) => ({
      month: MONTHS[m],
      views: map[m]?.views ?? 0,
      clicks: map[m]?.clicks ?? 0,
      attendees: map[m]?.attendees ?? 0,
    }));
  }, [events]);

  // ── Paid vs Free pie ─────────────────────────────────────────────────────

  const paidFreeData = useMemo(() => {
    const paid = events.filter((e) => e.is_paid).length;
    const free = events.length - paid;
    return [
      { name: "Paid", value: paid, color: "hsl(var(--accent))" },
      { name: "Free", value: free, color: "hsl(var(--secondary))" },
    ].filter((d) => d.value > 0);
  }, [events]);

  // ── Status distribution ──────────────────────────────────────────────────

  const statusData = useMemo(() => {
    const counts = { live: 0, upcoming: 0, ended: 0 };
    events.forEach((e) => {
      counts[getStatus(e.start_datetime, e.end_datetime)]++;
    });
    return [
      { name: "Live", value: counts.live, color: "hsl(var(--secondary))" },
      {
        name: "Upcoming",
        value: counts.upcoming,
        color: "hsl(var(--primary))",
      },
      {
        name: "Ended",
        value: counts.ended,
        color: "hsl(var(--muted-foreground))",
      },
    ].filter((d) => d.value > 0);
  }, [events]);

  // ── Weekly attendee trend (last 8 events by date) ────────────────────────

  const weeklyTrend = useMemo(() => {
    const sorted = [...events]
      .sort(
        (a, b) =>
          new Date(a.start_datetime).getTime() -
          new Date(b.start_datetime).getTime(),
      )
      .slice(-8);

    return sorted.map((e, i) => ({
      label: `E${i + 1}`,
      attendees: e.total_attendees ?? 0,
      name: e.title,
    }));
  }, [events]);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's your event overview.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/events">
            <Plus className="h-4 w-4" /> New Event
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoadingAll
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    {stat.trend && (
                      <TrendingUp className="h-3 w-3 text-secondary" />
                    )}
                    {stat.sub}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Bar Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="mb-0.5 text-sm font-semibold text-foreground">
            Event Performance
          </h3>
          <p className="mb-5 text-xs text-muted-foreground">
            Monthly views, clicks and attendees
          </p>
          {isLoadingAll ? (
            <ChartSkeleton height="h-64" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtNum}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                  />
                  <Bar
                    dataKey="views"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="clicks"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="attendees"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend */}
          <div className="mt-3 flex items-center gap-4">
            {[
              { label: "Views", color: "hsl(var(--primary))" },
              { label: "Clicks", color: "hsl(var(--secondary))" },
              { label: "Attendees", color: "hsl(var(--accent))" },
            ].map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: l.color }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Paid vs Free Pie */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-0.5 text-sm font-semibold text-foreground">
            Event Types
          </h3>
          <p className="mb-5 text-xs text-muted-foreground">
            Paid vs free breakdown
          </p>

          {isLoadingAll ? (
            <ChartSkeleton height="h-40" />
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        paidFreeData.length
                          ? paidFreeData
                          : [
                              {
                                name: "No data",
                                value: 1,
                                color: "hsl(var(--muted))",
                              },
                            ]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(paidFreeData.length
                        ? paidFreeData
                        : [{ color: "hsl(var(--muted))" }]
                      ).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {paidFreeData.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: d.color }}
                      />
                      {d.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-3 flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  By Status
                </p>
                {statusData.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: d.color }}
                      />
                      {d.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attendee Trend */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-0.5 text-sm font-semibold text-foreground">
          Attendee Trend
        </h3>
        <p className="mb-5 text-xs text-muted-foreground">
          Attendees across your last {weeklyTrend.length} events
        </p>
        {isLoadingAll ? (
          <ChartSkeleton height="h-48" />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="attendees"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{
                    fill: "hsl(var(--primary))",
                    r: 4,
                    strokeWidth: 2,
                    stroke: "hsl(var(--card))",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Events Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentEventsTable />
      </div>
    </div>
  );
}
