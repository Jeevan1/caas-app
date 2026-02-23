import { CategoryOverview } from "@/components/dashboard/category-overview";
import { CATEGORIES_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Categories - CaaS",
  description:
    "Manage your campaigns, track analytics, and grow your business from your CaaS dashboard.",
};
export async function getEvents() {
  const res = await serverFetch("/event/categories/");
  return res;
}

export default async function DashboardPage() {
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
