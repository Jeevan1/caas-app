import { ProfileOverview } from "@/components/dashboard/profile-overview";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requirePermission } from "@/lib/permissions/require-permission";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Profile - Join Your Event",
  description:
    "Manage your campaigns, track analytics, and grow your business from your Join Your Event dashboard.",
};
export async function getUser() {
  const res = await serverFetch("/autho/user_info/me");
  return res;
}
export const PROFILE_QUERY_KEY = ["profile", "me"];

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const id = user?.id;
  await requirePermission("user_info-me:get", {
    id,
  });
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getUser,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileOverview />
    </HydrationBoundary>
  );
}
