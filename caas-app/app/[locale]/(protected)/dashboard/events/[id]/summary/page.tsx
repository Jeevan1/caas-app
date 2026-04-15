import { EventsSummaryOverview } from "@/components/dashboard/event-summary-overview";
import { EVENT_DETAILS_QUERY_KEY, EVENT_SUMMARY_QUERY_KEY } from "@/constants";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import { Event } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";

export async function getEventSummary(id: string) {
  const res = await serverFetch(`/event/events/${id}/summary`);
  return res;
}

export async function getEventDetails(id: string) {
  const res = await serverFetch(`/event/events/my-events/${id}`);
  return res;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const res = await getEventDetails(id);

  if (!res) {
    return {
      title: "Event | Join Your Event",
      description: "Discover and join events on Join Your Event Platform.",
    };
  }

  const event = res as Event;

  const title = `${event.title} | Join Your Event`;
  const description =
    event.description?.slice(0, 160) ??
    "Join this event on Join Your Event Platform.";

  return {
    title,
    description,
  };
}

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function DashboardPage({ params }: Props) {
  await requirePermission("events-summary:get");
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: EVENT_SUMMARY_QUERY_KEY(id),
      queryFn: () => getEventSummary(id),
    }),
    queryClient.prefetchQuery({
      queryKey: EVENT_DETAILS_QUERY_KEY(id),
      queryFn: () => getEventDetails(id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsSummaryOverview id={id} />
    </HydrationBoundary>
  );
}
