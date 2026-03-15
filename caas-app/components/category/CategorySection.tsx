"use client";
import { CATEGORIES_QUERY_KEY } from "@/constants";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { Category, PaginatedAPIResponse } from "@/lib/types";
import { useState } from "react";
import { Section } from "../section";
import { Search } from "lucide-react";
import CategoryCard from "../CategoryCard";

const CategorySection = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<Category>>({
    url: "/api/event/categories",
    queryKey: CATEGORIES_QUERY_KEY,
  });

  const categories = data?.results ?? [];

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <section className="py-20 bg-card md:py-24">
        <div className="mx-auto container px-6">
          <Section>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Explore
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Browse by category
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Find events that match exactly what you're into.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  placeholder="Search categories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-border bg-muted h-32"
                  />
                ))
              : filteredCategories.map((cat, i) => (
                  <Section key={cat.idx} delay={i * 0.05}>
                    <CategoryCard cat={cat} />
                  </Section>
                ))}
            {!isLoading && search && filteredCategories.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                No categories match "{search}"
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CategorySection;
