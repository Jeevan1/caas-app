import EventDetails from "@/components/events/EventDetails";
import {
  EVENTS_QUERY_KEY,
  RELATED_EVENTS_QUERY_KEY,
  SINGLE_EVENT_QUERY_KEY,
} from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";

const getEventById = async (id: string) => {
  const res = await serverFetch<Event>(`/event/events/${id}/`);
  return res;
};

const getRelatedEvents = async (id: string) => {
  const res = await serverFetch<PaginatedAPIResponse<Event>>(`/event/events/`);
  return res;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await getEventById(params.id);

  if (!event) return {};

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: `https://caas-app-pro.netlify.app/events/${params.id}`,
      siteName: "CaaS-App",
      images: [
        {
          url: event.cover_image || "",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
  };
}

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: SINGLE_EVENT_QUERY_KEY(id),
      queryFn: () => getEventById(id),
    }),
    queryClient.prefetchQuery({
      queryKey: EVENTS_QUERY_KEY,
      queryFn: () => getRelatedEvents(id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetails eventId={id} />
    </HydrationBoundary>
  );
};

export default EventDetailsPage;
