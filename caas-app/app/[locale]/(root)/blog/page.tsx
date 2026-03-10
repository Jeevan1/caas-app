import { CTASection } from "@/components/about/cta-section";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog - CaaS",
  description:
    "Marketing tips, case studies, and success stories to help you grow your business with CaaS.",
};

const featuredPost = {
  slug: "how-to-triple-leads",
  title: "How to Triple Your Leads in 30 Days with CaaS",
  excerpt:
    "Learn the exact strategy our top users employ to dramatically increase their lead generation using our platform's campaign tools and analytics.",
  category: "Case Study",
  readTime: "8 min read",
  date: "Feb 10, 2026",
  author: "Sarah Mitchell",
};

const posts = [
  {
    slug: "social-media-tips-2026",
    title: "10 Social Media Marketing Tips for 2026",
    excerpt:
      "Stay ahead of the curve with these proven social media strategies that drive engagement and conversions.",
    category: "Marketing Tips",
    readTime: "5 min read",
    date: "Feb 8, 2026",
    author: "Marcus Johnson",
  },
  {
    slug: "email-campaign-guide",
    title: "The Ultimate Guide to Email Campaign Design",
    excerpt:
      "From subject lines to CTAs, learn how to craft email campaigns that get opened, read, and clicked.",
    category: "Tutorial",
    readTime: "7 min read",
    date: "Feb 5, 2026",
    author: "Emily Chen",
  },
  {
    slug: "small-business-promotion",
    title: "Promoting Your Small Business on a Budget",
    excerpt:
      "Discover cost-effective marketing strategies that deliver results without breaking the bank.",
    category: "Guide",
    readTime: "6 min read",
    date: "Feb 1, 2026",
    author: "David Lee",
  },
  {
    slug: "gamification-marketing",
    title: "How Gamification Boosts Marketing Engagement",
    excerpt:
      "Why adding game-like elements to your campaigns can increase user participation by over 200%.",
    category: "Case Study",
    readTime: "4 min read",
    date: "Jan 28, 2026",
    author: "Sarah Mitchell",
  },
  {
    slug: "referral-programs",
    title: "Building a Referral Program That Works",
    excerpt:
      "Step-by-step guide to creating referral campaigns that turn your customers into your best marketers.",
    category: "Tutorial",
    readTime: "6 min read",
    date: "Jan 24, 2026",
    author: "Marcus Johnson",
  },
  {
    slug: "analytics-beginners",
    title: "Campaign Analytics for Beginners",
    excerpt:
      "Understanding views, clicks, CTR, and conversion rates to make smarter marketing decisions.",
    category: "Guide",
    readTime: "5 min read",
    date: "Jan 20, 2026",
    author: "Emily Chen",
  },
];

export default function BlogPage() {
  return (
    <section>
      {/* Hero */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto container text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Blog & Resources
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            Tips, guides, and success stories
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Learn how to run better campaigns, grow your audience, and get the
            most out of CaaS.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="bg-card py-12">
        <div className="mx-auto container">
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src="/images/blog-featured.jpg"
                  alt="Person working on marketing analytics with charts and growth metrics"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <span className="mb-3 inline-flex w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {featuredPost.category}
                </span>
                <h2 className="mb-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {featuredPost.excerpt}
                </p>
                <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{featuredPost.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime}
                  </span>
                  <span>{featuredPost.date}</span>
                </div>
                <Link href="#">
                  <Button className="gap-2">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="bg-card pb-24 pt-12">
        <div className="mx-auto container">
          <h2 className="mb-8 font-heading text-2xl font-bold text-foreground">
            Latest Articles
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col rounded-2xl border border-border bg-background transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center rounded-t-2xl bg-muted/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-xl font-bold font-heading">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-2 inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {post.category}
                  </span>
                  <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </section>
  );
}
