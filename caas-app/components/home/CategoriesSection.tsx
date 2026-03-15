import { Link } from "@/i18n/navigation";
import { serverFetch } from "@/lib/server-fetch";

import { Suspense } from "react";
import { EventCardGridLoader } from "../fallback/EventCardSkeleton";
import { getRandomColor } from "@/lib/helpers";
import { Category, PaginatedAPIResponse } from "@/lib/types";
import Image from "next/image";
import { Section } from "../section";
import CategoryCard from "../CategoryCard";

export async function getCategories() {
  const res =
    await serverFetch<PaginatedAPIResponse<Category>>("/event/categories/");
  return res?.results;
}

export async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <Section className="bg-card py-20 md:py-24 overflow-hidden">
      <div className="mx-auto container">
        <div
          className="mb-12 md:mb-16 text-center cat-header"
          style={{ animation: "catFadeUp 0.6s ease both" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Browse by interest
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Explore top categories
          </h2>
        </div>

        <Suspense fallback={<EventCardGridLoader />}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories?.map((cat, i) => {
              const color = getRandomColor();
              return (
                <Section key={cat.idx} delay={i * 0.1}>
                  <CategoryCard cat={cat} />
                </Section>
              );
            })}
          </div>
        </Suspense>
      </div>
    </Section>
  );
}
