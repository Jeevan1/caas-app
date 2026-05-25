import CategoryDetails from "@/components/events/CategoriesDetails";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import {
  EVENTS_BY_CATEGORY_QUERY_KEY,
  SINGLE_CATEGORY_QUERY_KEY,
} from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, buildLocaleAlternates } from "@/lib/seo";
import { Category, Event, PaginatedAPIResponse } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(
      `${process.env.MASTER_URL}/event/categories/${id}/`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) throw new Error("Not found");

    const category: Category = await res.json();

    const path  = `/category/${id}`;
    const title = `${category.name} Events`;
    const description =
      category.description ||
      `Discover ${category.name} events on ${SITE_NAME}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url:      `${SITE_URL}${path}`,
        siteName: SITE_NAME,
        type:     "website",
        images:   [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card:        "summary_large_image",
        site:        "@joinyourevent",
        title,
        description,
        images:      [DEFAULT_OG_IMAGE],
      },
      alternates: buildLocaleAlternates(path),
    };
  } catch {
    return {
      title: "Category",
      robots: { index: false },
    };
  }
}

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
      <BreadcrumbJsonLd
        items={[
          { name: "Categories", url: `${SITE_URL}/category` },
          { name: id, url: `${SITE_URL}/category/${id}` },
        ]}
      />
      <CategoryDetails id={id} />
    </HydrationBoundary>
  );
};

export default CategoryDetailsPage;
