import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const articles = [
  {
    id: 1,
    title: "I Used CaaS to Promote My Business at a Local Event",
    excerpt:
      "A Kathmandu café owner shares how she ran her first campaign and gained 150 new customers in a weekend.",
    href: "/blog/caas-local-event",
    emoji: "☕",
  },
  {
    id: 2,
    title: "How to Turn Casual Leads into Loyal Customers",
    excerpt:
      "Building repeat business is harder than getting the first sale. Here's what the data shows actually works.",
    href: "/blog/leads-to-customers",
    emoji: "🤝",
  },
  {
    id: 3,
    title: "Do You Have the Right Number of Campaigns Running?",
    excerpt:
      "Studies show diminishing returns after a certain point. Learn how to find the sweet spot for your business.",
    href: "/blog/campaign-sweet-spot",
    emoji: "📈",
  },
];
export function CommunityStoriesSection() {
  return (
    <section className="bg-card py-16 md:py-20">
      <div className="mx-auto container">
        {/* Label */}
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          CaaS = community
        </p>

        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Success stories from our community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Since 2024, members have used CaaS to grow their businesses, reach
            new customers, and build loyal audiences. Learn how.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-background overflow-hidden transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* Article image placeholder */}
              <div className="flex h-44 items-center justify-center bg-muted text-6xl">
                {article.emoji}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                  {article.excerpt}
                </p>
                <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-background p-10 text-center">
          <h3 className="font-heading text-2xl font-bold text-foreground md:text-3xl text-balance">
            Join CaaS and find your community
          </h3>
          <div className="mt-6">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Sign up <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
