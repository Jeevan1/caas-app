import { ArrowRight, ChevronRight, Users, Zap } from "lucide-react";
import { Section } from "@/components/section";
import { Link } from "@/i18n/navigation";
import { CTASection } from "../about/cta-section";
import CategorySection from "./CategorySection";

// ─── Static data ──────────────────────────────────────────────────────────────

const popularGroups = [
  {
    name: "Kathmandu Dev Circle",
    members: 2140,
    events: 64,
    emoji: "💻",
    tags: ["Tech", "Coding"],
  },
  {
    name: "KTM Music Collective",
    members: 1380,
    events: 42,
    emoji: "🎵",
    tags: ["Music", "Live"],
  },
  {
    name: "Founders Nepal",
    members: 3200,
    events: 88,
    emoji: "🚀",
    tags: ["Startup", "Business"],
  },
  {
    name: "Food Explorers KTM",
    members: 910,
    events: 31,
    emoji: "🍜",
    tags: ["Food", "Social"],
  },
];

const upcomingEvents = [
  {
    title: "React Nepal Meetup #12",
    date: "Sat, Mar 22",
    time: "5:00 PM",
    attendees: 84,
    emoji: "💻",
    type: "In Person",
  },
  {
    title: "Startup Pitch Night — March",
    date: "Fri, Mar 21",
    time: "6:30 PM",
    attendees: 120,
    emoji: "🚀",
    type: "In Person",
  },
  {
    title: "Online: Intro to UI Design",
    date: "Mon, Mar 24",
    time: "7:00 PM",
    attendees: 210,
    emoji: "🎨",
    type: "Online",
  },
  {
    title: "Community Cleanup — Patan",
    date: "Sun, Mar 23",
    time: "8:00 AM",
    attendees: 45,
    emoji: "🌍",
    type: "In Person",
  },
];

const steps = [
  {
    n: "01",
    title: "Pick a category",
    body: "Browse by interest — tech, music, food, business and more.",
    emoji: "🔍",
  },
  {
    n: "02",
    title: "Find events or groups",
    body: "Discover what's happening near you or online in your chosen category.",
    emoji: "📍",
  },
  {
    n: "03",
    title: "RSVP & show up",
    body: "One-click registration. Show up, meet people, enjoy the experience.",
    emoji: "✅",
  },
  {
    n: "04",
    title: "Host your own",
    body: "Ready to organize? Post your event and grow your own community.",
    emoji: "🎯",
  },
];

const stories = [
  {
    title: "How a Tech Meetup Built Nepal's Tightest Dev Community",
    excerpt:
      "What started with 12 attendees grew into a 2,000-strong network of developers.",
    emoji: "💻",
    read: "4 min",
  },
  {
    title: "From First-Timer to Regular: My Event Journey",
    excerpt:
      "One attendee shares how showing up changed their social life completely.",
    emoji: "🤝",
    read: "3 min",
  },
  {
    title: "Why Small Community Events Have the Biggest Impact",
    excerpt:
      "A local organizer explains why intimate events create stronger connections.",
    emoji: "🌍",
    read: "5 min",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const Categories = () => {
  return (
    <>
      <CategorySection />

      {/* ══ 2. POPULAR GROUPS ════════════════════════════════════════════════ */}
      <section className="bg-background py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Section>
            <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Community
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Popular organizers
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Top communities hosting events on JoinYourEvent.com.
                </p>
              </div>
              <Link
                href="/organizers"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
              >
                See all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularGroups.map((g, i) => (
              <Section key={g.name} delay={i * 0.08}>
                <Link
                  href="#"
                  className="group-card group flex flex-col rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl transition-transform duration-300 group-hover:scale-110">
                    {g.emoji}
                  </div>
                  <p className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {g.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {g.members.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-accent" />
                      {g.events} events
                    </span>
                  </div>
                </Link>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto container px-6">
          <Section>
            <div className="mb-12 md:mb-16 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                How it works
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                From browsing to belonging
              </h2>
            </div>
          </Section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Section key={s.n} delay={i * 0.1}>
                <div className="step-card relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <span className="mb-4 font-heading text-4xl font-black text-foreground/10 leading-none">
                    {s.n}
                  </span>
                  <span className="mb-3 text-3xl">{s.emoji}</span>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                  {i < steps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                  )}
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. MEMBER STORIES ════════════════════════════════════════════════ */}
      <section className="bg-card py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Section>
            <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Inspiration
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Stories from our community
                </h2>
              </div>
              <Link
                href="/blog"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
              >
                Read more <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Section>
          <div className="grid gap-5 sm:grid-cols-3">
            {stories.map((s, i) => (
              <Section key={s.title} delay={i * 0.1}>
                <Link
                  href="#"
                  className="story-card group flex flex-col overflow-hidden rounded-3xl border border-border bg-background transition-all hover:border-primary/20 hover:shadow-xl"
                >
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
                    <span className="story-emoji text-7xl opacity-30 transition-all duration-500 group-hover:scale-125 group-hover:opacity-50 select-none">
                      {s.emoji}
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                      📖 {s.read}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {s.excerpt}
                    </p>
                    <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">
                      Read story{" "}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. BOTTOM CTA ════════════════════════════════════════════════════ */}
      <CTASection />

      <style>{`
        .cat-card  { transition:transform .25s cubic-bezier(.34,1.4,.64,1),box-shadow .25s ease; }
        .cat-card:hover { transform:translateY(-6px); }
        .group-card{ transition:transform .22s cubic-bezier(.34,1.4,.64,1),box-shadow .22s ease; }
        .group-card:hover { transform:translateY(-4px); }
        .event-row { transition:transform .18s ease,box-shadow .18s ease; }
        .event-row:hover { transform:translateX(4px); }
        .step-card { transition:transform .22s cubic-bezier(.34,1.4,.64,1),box-shadow .22s ease; }
        .step-card:hover { transform:translateY(-4px); }
        .story-card{ transition:transform .28s cubic-bezier(.34,1.3,.64,1),box-shadow .28s ease; }
        .story-card:hover { transform:translateY(-6px) scale(1.01); }
        .cta-btn   { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
        .cta-btn:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 20px 40px -8px rgba(0,0,0,.25); }
        .cta-orb-1 { animation:orb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation:orb2 11s ease-in-out infinite; }
        @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-16px,20px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-16px)}}
      `}</style>
    </>
  );
};

export default Categories;
