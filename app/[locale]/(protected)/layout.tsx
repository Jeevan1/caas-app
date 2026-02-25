import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CurrentUserProvider } from "@/lib/providers";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    default: "MHR",
    template: "%s | MHR",
  },
  description: "MHR Dashboard",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
