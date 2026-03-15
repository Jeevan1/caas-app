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
