import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata = {
  title: "Dashboard - CaaS",
  description: "Manage your campaigns, track analytics, and grow your business from your CaaS dashboard.",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <DashboardOverview />
      </main>
    </div>
  )
}
