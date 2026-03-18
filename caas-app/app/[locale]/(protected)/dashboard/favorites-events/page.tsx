import FavoriteEventsOverview from "@/components/events/FavoriteEvents";
import { FAVORITE_EVENTS_QUERY_KEY } from "@/constants";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Favorites - Join Your Event",
  description: "View your favorite events",
};
export async function getFavoritesEvents() {
  const res = await serverFetch("/event/favorites/");
  return res;
}

export default async function FavoritesPage() {
  await requirePermission("event_favorites-list:get");
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: FAVORITE_EVENTS_QUERY_KEY,
    queryFn: getFavoritesEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoriteEventsOverview />
    </HydrationBoundary>
  );
}
