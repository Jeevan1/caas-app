import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jeevan Shrestha",
    role: "Community Organizer · Kathmandu",
    quote:
      "JoinYourEvent made it so easy to reach people who actually care about our meetups. Our last event sold out in 48 hours — something that never happened before.",
    rating: 5,
  },
  {
    name: "Krishna Rimal",
    role: "Startup Founder · Tech Meetup Host",
    quote:
      "We used to spend hours promoting events across different platforms. Now everything is in one place and our RSVP numbers have doubled every month.",
    rating: 5,
  },
  {
    name: "Asmit Dhakal",
    role: "Attendee & Volunteer",
    quote:
      "I discovered three amazing local events in my first week. The platform makes it genuinely fun to find things happening around you and connect with people.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-card py-20 md:py-24">
      <div className="mx-auto container">
        <div className="mb-12 md:mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Loved by organizers and attendees alike
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
