import Events from "@/components/events/Events";
import { EVENTS_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Event } from "@/lib/types";
import { QueryClient } from "@tanstack/react-query";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Browse Events",
  description:
    "Browse and discover upcoming events on Join Your Event. Find local meetups, conferences, workshops, and community events near you in Nepal.",
  path: "/events",
});

const getEvents = async () => {
  const res = await serverFetch<Event>(`/event/events/`);
  return res;
};

const EventDetailsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => getEvents(),
  });

  return <Events />;
};

export default EventDetailsPage;
