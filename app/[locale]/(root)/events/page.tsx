import { EVENTS_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Event } from "@/lib/types";
import { QueryClient } from "@tanstack/react-query";

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

  return <section>dsjh</section>;
};

export default EventDetailsPage;
