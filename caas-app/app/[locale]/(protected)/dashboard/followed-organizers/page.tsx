import FollowedOrganizersOverview from "@/components/organizer/FollowedOverview";
import { FOLLOW_QUERY_KEY } from "@/constants";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Followed Organizers - Join Your Event",
  description: "View followed organizers",
};
export async function getFavoritesEvents() {
  const res = await serverFetch("/event/organizer-follows/");
  return res;
}

export default async function FollowedOrganizerPage() {
  const user = await getCurrentUser();
  await requirePermission("organizer_follows-list:get", {
    id: user?.id,
  });
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: FOLLOW_QUERY_KEY,
    queryFn: getFavoritesEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FollowedOrganizersOverview />
    </HydrationBoundary>
  );
}
