import { JoinRequestOverview } from "@/components/dashboard/join-request-ovrerview";
import { JOIN_REQUEST_QUERY_KEY } from "@/constants";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Join Requests - Join Your Event",
  description: "View join requests",
};

export async function getRequests(id: string) {
  const res = await serverFetch(`/event/events/${id}/joins/`);
  return res;
}

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function JoinRequestPage({ params }: Props) {
  await requirePermission("event_joins-list:get");
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: JOIN_REQUEST_QUERY_KEY,
    queryFn: () => getRequests(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JoinRequestOverview id={id} />
    </HydrationBoundary>
  );
}
