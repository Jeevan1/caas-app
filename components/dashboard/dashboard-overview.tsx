"use client"

import {
  Megaphone,
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Trophy,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
} from "recharts"

const stats = [
  {
    label: "Active Campaigns",
    value: "12",
    change: "+3",
    icon: Megaphone,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Total Views",
    value: "24.8K",
    change: "+12%",
    icon: Eye,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    label: "Total Clicks",
    value: "3,421",
    change: "+24%",
    icon: MousePointerClick,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "Leads Generated",
    value: "847",
    change: "+18%",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

const monthlyData = [
  { month: "Jan", views: 4000, clicks: 2400, leads: 400 },
  { month: "Feb", views: 3000, clicks: 1398, leads: 300 },
  { month: "Mar", views: 5000, clicks: 3800, leads: 500 },
  { month: "Apr", views: 4780, clicks: 3908, leads: 480 },
  { month: "May", views: 5890, clicks: 4800, leads: 600 },
  { month: "Jun", views: 6390, clicks: 3800, leads: 700 },
  { month: "Jul", views: 7490, clicks: 4300, leads: 850 },
]

const leadTrend = [
  { week: "W1", leads: 120 },
  { week: "W2", leads: 190 },
  { week: "W3", leads: 160 },
  { week: "W4", leads: 240 },
  { week: "W5", leads: 210 },
  { week: "W6", leads: 310 },
  { week: "W7", leads: 280 },
  { week: "W8", leads: 350 },
]

const channelData = [
  { name: "Social Media", value: 45, color: "hsl(217, 91%, 50%)" },
  { name: "Email", value: 30, color: "hsl(152, 60%, 42%)" },
  { name: "Referral", value: 15, color: "hsl(28, 90%, 55%)" },
  { name: "Direct", value: 10, color: "hsl(200, 80%, 60%)" },
]

const campaigns = [
  {
    name: "Summer Sale 2026",
    type: "Product",
    status: "Active",
    views: 4521,
    clicks: 1230,
    leads: 189,
  },
  {
    name: "Workshop Series",
    type: "Event",
    status: "Active",
    views: 3200,
    clicks: 890,
    leads: 145,
  },
  {
    name: "Newsletter Q1",
    type: "Email",
    status: "Completed",
    views: 8900,
    clicks: 2100,
    leads: 312,
  },
  {
    name: "Product Launch",
    type: "Product",
    status: "Active",
    views: 6700,
    clicks: 1800,
    leads: 267,
  },
  {
    name: "Referral Program",
    type: "Referral",
    status: "Active",
    views: 2100,
    clicks: 670,
    leads: 98,
  },
]

const leaderboard = [
  { rank: 1, name: "Sarah M.", points: 12400, campaigns: 24 },
  { rank: 2, name: "Marcus J.", points: 11200, campaigns: 21 },
  { rank: 3, name: "Emily C.", points: 9800, campaigns: 18 },
  { rank: 4, name: "David L.", points: 8500, campaigns: 15 },
  { rank: 5, name: "You", points: 7200, campaigns: 12 },
]

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here is your campaign overview.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-secondary">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart - Campaign Performance */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            Campaign Performance
          </h3>
          <p className="mb-6 text-xs text-muted-foreground">
            Monthly views, clicks, and leads
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="hsl(28, 90%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Channels */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            Traffic Sources
          </h3>
          <p className="mb-6 text-xs text-muted-foreground">
            Where your leads come from
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {channelData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
                <span className="font-medium text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Trend */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Lead Generation Trend
        </h3>
        <p className="mb-6 text-xs text-muted-foreground">
          Weekly leads over the past 8 weeks
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(217, 91%, 50%)"
                strokeWidth={2}
                dot={{ fill: "hsl(217, 91%, 50%)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Table + Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaigns Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Campaigns</h3>
              <p className="text-xs text-muted-foreground">Manage and track your campaigns</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Views</th>
                  <th className="px-6 py-3 text-right">Clicks</th>
                  <th className="px-6 py-3 text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {c.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.status === "Active"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground">
                      {c.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                      {c.leads.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Top promoters this month</p>
          </div>
          <div className="flex flex-col">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 border-b border-border px-6 py-4 last:border-0 ${
                  entry.name === "You" ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    entry.rank === 1
                      ? "bg-accent/10 text-accent"
                      : entry.rank === 2
                      ? "bg-muted text-muted-foreground"
                      : entry.rank === 3
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.rank}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${entry.name === "You" ? "text-primary" : "text-foreground"}`}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.campaigns} campaigns
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {entry.points.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">pts</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
