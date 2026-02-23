import { EventsOverview } from "@/components/dashboard/events-overview";
import { EVENTS_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Events - CaaS",
  description:
    "Manage your campaigns, track analytics, and grow your business from your CaaS dashboard.",
};
export async function getEvents() {
  const res = await serverFetch("/event/events/my-events/");
  return res;
}

export default async function DashboardPage() {
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
