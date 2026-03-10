import CategoryDetails from "@/components/events/CategoriesDetails";
import {
  EVENTS_BY_CATEGORY_QUERY_KEY,
  SINGLE_CATEGORY_QUERY_KEY,
} from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Category, Event, PaginatedAPIResponse } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const getCategoryById = async (id: string) => {
  const res = await serverFetch<Event>(`/event/categories/${id}/`);
  return res;
};

const getEventsByCategory = async (id: string) => {
  const res = await serverFetch<PaginatedAPIResponse<Category>>(
    `/event/events/?category=${id}`,
  );
  return res;
};

const CategoryDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: SINGLE_CATEGORY_QUERY_KEY(id),
      queryFn: () => getCategoryById(id),
    }),
    queryClient.prefetchQuery({
      queryKey: EVENTS_BY_CATEGORY_QUERY_KEY(id),
      queryFn: () => getEventsByCategory(id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDetails id={id} />
    </HydrationBoundary>
  );
};

export default CategoryDetailsPage;
