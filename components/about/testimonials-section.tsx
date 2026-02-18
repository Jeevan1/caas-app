import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Event Organizer",
    quote:
      "CaaS helped me promote my events with zero marketing experience. The templates are gorgeous and the analytics are spot on.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    quote:
      "I went from struggling with marketing to running 8 campaigns simultaneously. My leads have tripled in just 2 months.",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Content Creator",
    quote:
      "The gamification aspect keeps me motivated, and the leaderboard adds a fun competitive element. My engagement is up 200%.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-card py-24">
      <div className="mx-auto container">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Loved by thousands of businesses
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {`"${t.quote}"`}
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
