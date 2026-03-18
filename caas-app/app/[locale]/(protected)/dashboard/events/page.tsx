import { EventsOverview } from "@/components/dashboard/events-overview";
import { EVENTS_QUERY_KEY } from "@/constants";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Events - Join Your Event",
  description:
    "Manage your campaigns, track analytics, and grow your business from your Join Your Event dashboard.",
};
export async function getEvents() {
  const res = await serverFetch("/event/events/my-events/");
  return res;
}

export default async function DashboardPage() {
  await requirePermission("events-my-events:get");
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: getEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsOverview />
    </HydrationBoundary>
  );
}
