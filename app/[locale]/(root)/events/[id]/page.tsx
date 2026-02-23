import EventDetails from "@/components/events/EventDetails";
import { SINGLE_EVENT_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Event } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const getEventById = async (id: string) => {
  const res = await serverFetch<Event>(`/event/events/${id}/`);
  return res;
};

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: SINGLE_EVENT_QUERY_KEY(id),
    queryFn: () => getEventById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetails eventId={id} />
    </HydrationBoundary>
  );
};

export default EventDetailsPage;
