import { BlogOverview } from "@/components/dashboard/blogs-overview";
import { BLOG_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata = {
  title: "Blogs - Join Your Event",
  description:
    "Manage your campaigns, track analytics, and grow your business from your Join Your Event dashboard.",
};
export async function getBlogs() {
  const res = await serverFetch("/event/blogs/");
  return res;
}

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: BLOG_QUERY_KEY,
    queryFn: getBlogs,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogOverview />
    </HydrationBoundary>
  );
}
