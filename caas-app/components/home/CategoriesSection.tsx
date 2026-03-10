import { Link } from "@/i18n/navigation";
import { serverFetch } from "@/lib/server-fetch";

import { Suspense } from "react";
import { EventCardGridLoader } from "../fallback/EventCardSkeleton";
import { getRandomColor } from "@/lib/helpers";
import { Category, PaginatedAPIResponse } from "@/lib/types";
import Image from "next/image";

export async function getCategories() {
  const res =
    await serverFetch<PaginatedAPIResponse<Category>>("/event/categories/");
  return res?.results;
}

export async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="bg-background py-20 md:py-24 overflow-hidden">
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
                <Link
                  key={cat.idx}
                  href={"/category/" + cat.idx}
                  className="cat-card group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card px-4 py-8 text-center"
                  style={
                    {
                      animation: `catFadeUp 0.5s ease both`,
                      animationDelay: `${0.05 * i + 0.1}s`,
                      "--cat-color": `hsl(${color})`,
                    } as React.CSSProperties
                  }
                >
                  <div className="cat-bg absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300" />

                  <div
                    className="cat-icon relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300"
                    style={{
                      background: `hsl(${color} / 0.12)`,
                      color: `hsl(${color})`,
                    }}
                  >
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={32}
                        height={32}
                      />
                    )}
                  </div>

                  <span className="relative z-10 text-xs font-semibold leading-tight text-foreground transition-colors duration-300 cat-label">
                    {cat.name}
                  </span>

                  <div
                    className="cat-line absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full transition-all duration-300"
                    style={{ background: `hsl(${color})` }}
                  />
                </Link>
              );
            })}
          </div>
        </Suspense>
      </div>

      <style>{`
        /* ── Entrance ─────────────────────────────── */
        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Hover fill using the per-card color var ─ */
        .cat-card:hover .cat-bg {
          opacity: 0.07;
          background: var(--cat-color);
        }

        /* ── Icon bounce + fill ───────────────────── */
        .cat-card:hover .cat-icon {
          background: var(--cat-color) !important;
          color: #fff !important;
          transform: translateY(-4px) scale(1.08);
          border-radius: 1rem;
          box-shadow: 0 8px 24px -4px color-mix(in srgb, var(--cat-color) 40%, transparent);
        }

        /* ── Label color shift ────────────────────── */
        .cat-card:hover .cat-label {
          color: var(--cat-color);
        }

        /* ── Bottom accent line expands ───────────── */
        .cat-card:hover .cat-line {
          width: 40%;
        }

        /* ── Card lift ────────────────────────────── */
        .cat-card {
          transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px -8px hsl(var(--foreground) / 0.08);
          border-color: var(--cat-color);
        }
      `}</style>
    </section>
  );
}
