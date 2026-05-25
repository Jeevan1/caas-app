import PageBanner from "@/components/PageBanner";
import { serverFetch } from "@/lib/server-fetch";
import { Category as CategoryType, PaginatedAPIResponse } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CATEGORIES_QUERY_KEY } from "@/constants";
import Categories from "@/components/category/Category";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Event Categories",
  description:
    "Browse event categories on Join Your Event. Find events by category — music, tech, sports, workshops, conferences, and more.",
  path: "/category",
});

export async function getCategories() {
  const res =
    await serverFetch<PaginatedAPIResponse<CategoryType>>("/event/categories/");
  return res?.results;
}

export default async function CategoriesPage() {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
  });

  return (
    <div className="min-h-screen bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PageBanner
          title="Categories"
          description="Discover events and groups by category."
          heading="Browse by category"
        />
        <Categories />
      </HydrationBoundary>
    </div>
  );
}
