import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasPermission } from "@/lib/permissions/has-permissions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard - Join Your Event",
  description:
    "Manage your campaigns, track analytics, and grow your business from your Join Your Event dashboard.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const perms = hasPermission(user, ["events-my-events:get"]);
  if (!perms) redirect("/dashboard/joined-events");
  return <DashboardOverview />;
}
