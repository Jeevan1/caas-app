import { CategoryOverview } from "@/components/dashboard/category-overview";
import { CATEGORIES_QUERY_KEY } from "@/constants";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Categories - Join Your Event",
  description:
    "Manage your campaigns, track analytics, and grow your business from your Join Your Event dashboard.",
};
export async function getEvents() {
  const res = await serverFetch("/event/categories/");
  return res;
}

export default async function DashboardPage() {
  await requirePermission("event_categories-list:get");
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryOverview />
    </HydrationBoundary>
  );
}
