import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata = {
  title: "Dashboard - CaaS",
  description:
    "Manage your campaigns, track analytics, and grow your business from your CaaS dashboard.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
