import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  Search,
  Sparkles,
  Globe,
  TreePine,
  Pizza,
  Puzzle,
  Dumbbell,
  Heart,
  Cpu,
  Palette,
  Gamepad2,
  Briefcase,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "./Herosection";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const nearbyEvents = [
  {
    id: 1,
    title: "Startup Pitch Night & Networking",
    group: "Entrepreneurs of Kathmandu",
    date: "Thu, Feb 20 · 6:00 PM",
    attendees: 42,
    emoji: "🚀",
  },
  {
    id: 2,
    title: "Weekend Hike: Shivapuri Hills Trail",
    group: "Kathmandu Outdoor Club",
    date: "Sat, Feb 22 · 7:00 AM",
    attendees: 67,
    emoji: "🏔️",
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    group: "Growth Hackers Nepal",
    date: "Sun, Feb 23 · 2:00 PM",
    attendees: 89,
    emoji: "📊",
  },
  {
    id: 4,
    title: "Photography Walk: Thamel District",
    group: "Nepal Street Photographers",
    date: "Sat, Feb 22 · 9:00 AM",
    attendees: 23,
    emoji: "📸",
  },
  {
    id: 5,
    title: "Book Club: The Lean Startup",
    group: "Kathmandu Readers Circle",
    date: "Wed, Feb 19 · 5:30 PM",
    attendees: 18,
    emoji: "📚",
  },
  {
    id: 6,
    title: "Open Mic Night & Jam Session",
    group: "Kathmandu Music Community",
    date: "Fri, Feb 21 · 7:00 PM",
    attendees: 54,
    emoji: "🎵",
  },
];

const onlineEvents = [
  {
    id: 1,
    title: "AI Tools for Small Business Owners",
    group: "Digital Entrepreneurs Asia",
    date: "Thu, Feb 20 · 3:00 PM UTC",
    attendees: 312,
    emoji: "🤖",
  },
  {
    id: 2,
    title: "Social Media Strategy Q&A",
    group: "Marketing Pros Network",
    date: "Fri, Feb 21 · 1:00 PM UTC",
    attendees: 208,
    emoji: "📱",
  },
  {
    id: 3,
    title: "Build Your Brand in 30 Days",
    group: "Startup Growth Community",
    date: "Sat, Feb 22 · 11:00 AM UTC",
    attendees: 479,
    emoji: "🎯",
  },
  {
    id: 4,
    title: "Email Marketing Best Practices 2026",
    group: "Growth Marketers Global",
    date: "Sun, Feb 23 · 4:00 PM UTC",
    attendees: 156,
    emoji: "✉️",
  },
];

const categories = [
  {
    icon: TreePine,
    label: "Travel & Outdoor",
    href: "/category",
    color: "var(--secondary)",
  },
  {
    icon: Pizza,
    label: "Social Activities",
    href: "/category",
    color: "var(--accent)",
  },
  {
    icon: Puzzle,
    label: "Hobbies & Passions",
    href: "/category",
    color: "var(--primary)",
  },
  {
    icon: Dumbbell,
    label: "Sports & Fitness",
    href: "/category",
    color: "var(--secondary)",
  },
  {
    icon: Heart,
    label: "Health & Wellbeing",
    href: "/category",
    color: "var(--accent)",
  },
  {
    icon: Cpu,
    label: "Technology",
    href: "/category",
    color: "var(--primary)",
  },
  {
    icon: Palette,
    label: "Art & Culture",
    href: "/category",
    color: "var(--secondary)",
  },
  { icon: Gamepad2, label: "Games", href: "/category", color: "var(--accent)" },
  {
    icon: Briefcase,
    label: "Career & Business",
    href: "/category",
    color: "var(--primary)",
  },
  {
    icon: FlaskConical,
    label: "Science & Education",
    href: "/category",
    color: "var(--secondary)",
  },
];

const cities = [
  {
    name: "New York",
    emoji: "🗽",
    events: "2.4K events",
    gradient: "from-blue-950/80 via-blue-900/50",
  },
  {
    name: "San Francisco",
    emoji: "🌉",
    events: "1.8K events",
    gradient: "from-orange-950/80 via-orange-900/50",
  },
  {
    name: "Nepal",
    emoji: "🏔️",
    events: "1.2K events",
    gradient: "from-red-950/80 via-red-800/50",
  },
  {
    name: "Nashville",
    emoji: "🎸",
    events: "890 events",
    gradient: "from-amber-950/80 via-amber-900/50",
  },
  {
    name: "Miami",
    emoji: "🌴",
    events: "1.1K events",
    gradient: "from-cyan-950/80 via-cyan-900/50",
  },
];

const howItWorksSteps = [
  {
    icon: Search,
    title: "Discover events and groups",
    description:
      "See who's hosting local campaigns and events for all the things you love.",
    cta: "Search events and groups",
    href: "/find",
  },
  {
    icon: Users,
    title: "Find your people",
    description:
      "Connect over shared interests and enjoy meaningful experiences together.",
    cta: null,
    href: null,
  },
  {
    icon: Sparkles,
    title: "Start a group to host events",
    description:
      "Create your own group, draw from a community of thousands, and launch campaigns.",
    cta: "Start a group",
    href: "/start",
  },
];

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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function EventCard({
  event,
  online = false,
}: {
  event: (typeof nearbyEvents)[0];
  online?: boolean;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* Cover image area */}
      <div className="relative flex h-36 w-full items-center justify-center bg-muted text-5xl">
        {event.emoji}
        <span className="absolute left-3 top-3 rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
          Free
        </span>
        {online && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-foreground">
            <Globe className="h-3 w-3" /> Online
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3 shrink-0" />
          {event.date}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-auto">
          by {event.group}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        {/* Stacked avatar placeholders */}
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full border-2 border-card bg-primary/10 text-[9px] font-bold text-primary flex items-center justify-center"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {event.attendees} attendees
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — NEARBY EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export function NearbyEventsSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto container">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Near you
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Events near Kathmandu
            </h2>
          </div>
          <Link href="/find">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 hidden sm:flex"
            >
              See all events <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nearbyEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/find">
            <Button variant="outline" className="gap-2">
              See all events <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — ONLINE EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export function OnlineEventsSection() {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto container">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-secondary" />
              Online · Join from anywhere
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Upcoming online events
            </h2>
          </div>
          <Link href="/find/online">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 hidden sm:flex"
            >
              See all events <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {onlineEvents.map((event) => (
            <EventCard key={event.id} event={event} online />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/find/online">
            <Button variant="outline" className="gap-2">
              See all events <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — JOIN CTA
// ─────────────────────────────────────────────────────────────────────────────

const stats = [
  { value: "50K+", label: "Members" },
  { value: "12K+", label: "Active Now" },
  { value: "200+", label: "Cities" },
];

export function JoinCTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-32">
      {/* ── Animated background orbs ─────────────────────────────────────── */}
      <div
        aria-hidden
        className="cta-orb cta-orb-1 pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="cta-orb cta-orb-2 pointer-events-none absolute -bottom-40 -left-32 h-[600px] w-[600px] rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="cta-orb cta-orb-3 pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.04]"
      />

      {/* ── Grid texture overlay ──────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        {/* Eyebrow badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm"
          style={{ animation: "ctaFadeUp 0.6s ease both" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground/70" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Get started — it's free
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl text-balance"
          style={{ animation: "ctaFadeUp 0.6s ease 0.1s both" }}
        >
          Join CaaS
        </h2>

        {/* Body */}
        <p
          className="mx-auto mt-5 max-w-lg text-lg text-primary-foreground/75 text-balance"
          style={{ animation: "ctaFadeUp 0.6s ease 0.2s both" }}
        >
          People use CaaS to promote their businesses, reach new audiences, find
          support, and pursue their passions — together. Membership is free.
        </p>

        {/* CTA button */}
        <div
          className="mt-8"
          style={{ animation: "ctaFadeUp 0.6s ease 0.3s both" }}
        >
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="cta-btn gap-2 rounded-full px-8 text-base shadow-xl"
            >
              Sign up for free
              <ArrowRight className="h-4 w-4 cta-arrow" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Entrance */
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Floating orbs */
        @keyframes ctaOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-20px, 20px) scale(1.05); }
        }
        @keyframes ctaOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, -16px) scale(1.08); }
        }
        @keyframes ctaOrb3 {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50%       { transform: translateX(-50%) scale(1.12); }
        }

        .cta-orb-1 { animation: ctaOrb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation: ctaOrb2 10s ease-in-out infinite; }
        .cta-orb-3 { animation: ctaOrb3 6s ease-in-out infinite; }

        /* CTA button arrow */
        .cta-btn .cta-arrow {
          transition: transform 0.2s ease;
        }
        .cta-btn:hover .cta-arrow {
          transform: translateX(4px);
        }

        /* Button lift on hover */
        .cta-btn {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px -8px rgba(0,0,0,0.25);
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — EXPLORE TOP CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export function CategoriesSection() {
  return (
    <section className="bg-background py-24 overflow-hidden">
      <div className="mx-auto container">
        {/* Header */}
        <div
          className="mb-16 text-center cat-header"
          style={{ animation: "catFadeUp 0.6s ease both" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Browse by interest
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Explore top categories
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="cat-card group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card px-4 py-8 text-center"
              style={
                {
                  animation: `catFadeUp 0.5s ease both`,
                  animationDelay: `${0.05 * i + 0.1}s`,
                  "--cat-color": `hsl(${cat.color})`,
                } as React.CSSProperties
              }
            >
              {/* Hover fill background */}
              <div className="cat-bg absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300" />

              {/* Icon */}
              <div
                className="cat-icon relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300"
                style={{
                  background: `hsl(${cat.color} / 0.12)`,
                  color: `hsl(${cat.color})`,
                }}
              >
                <cat.icon className="h-6 w-6" />
              </div>

              {/* Label */}
              <span className="relative z-10 text-xs font-semibold leading-tight text-foreground transition-colors duration-300 cat-label">
                {cat.label}
              </span>

              {/* Bottom accent line */}
              <div
                className="cat-line absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full transition-all duration-300"
                style={{ background: `hsl(${cat.color})` }}
              />
            </Link>
          ))}
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — POPULAR CITIES
// ─────────────────────────────────────────────────────────────────────────────

export function PopularCitiesSection() {
  return (
    <section className="bg-card py-24 overflow-hidden">
      <div className="mx-auto container">
        {/* Header */}
        <div
          className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
          style={{ animation: "cityFadeUp 0.6s ease both" }}
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Discover
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Popular cities on CaaS
            </h2>
            <p className="mt-2 text-muted-foreground">
              See what organizers are planning in cities around the world.
            </p>
          </div>
          <Link
            href="/cities"
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
          >
            View all cities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* City cards grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {cities.map((city, i) => (
            <Link
              key={city.name}
              href="#"
              className="city-card group relative flex h-52 flex-col justify-end overflow-hidden rounded-3xl border border-border"
              style={{
                animation: `cityFadeUp 0.55s ease both`,
                animationDelay: `${0.08 * i + 0.15}s`,
              }}
            >
              {/* Muted bg base */}
              <div className="absolute inset-0 bg-muted" />

              {/* Emoji — scales and drifts on hover */}
              <div className="city-emoji absolute inset-0 flex items-center justify-center text-8xl select-none transition-all duration-500 ease-out">
                {city.emoji}
              </div>

              {/* Color gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${city.gradient} to-transparent opacity-60 transition-opacity duration-400 group-hover:opacity-80`}
              />

              {/* Shine sweep on hover */}
              <div className="city-shine absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700" />

              {/* Content */}
              <div className="relative flex flex-col gap-1 p-4">
                <div className="flex items-center gap-1.5 opacity-0 transition-all duration-300 city-meta">
                  <MapPin className="h-3 w-3 text-white/70" />
                  <span className="text-[11px] font-medium text-white/70">
                    {city.events}
                  </span>
                </div>
                <p className="font-heading text-lg font-bold text-white drop-shadow-md">
                  {city.name}
                </p>
              </div>

              {/* Bottom border accent */}
              <div className="city-accent absolute bottom-0 left-0 h-[3px] w-0 bg-white/60 transition-all duration-300 rounded-b-3xl" />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Entrance ─────────────────────────────── */
        @keyframes cityFadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Card lift ────────────────────────────── */
        .city-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .city-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.25);
          border-color: hsl(var(--border) / 0.6);
        }

        /* ── Emoji drift + grow ───────────────────── */
        .city-emoji {
          opacity: 0.38;
        }
        .city-card:hover .city-emoji {
          opacity: 0.75;
          transform: scale(1.2) translateY(-6px);
        }

        /* ── Shine sweep ──────────────────────────── */
        .city-card:hover .city-shine {
          transform: translateX(200%) skew(-20deg);
        }

        /* ── Event count slides up ────────────────── */
        .city-meta {
          transform: translateY(6px);
        }
        .city-card:hover .city-meta {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Bottom accent line expands ───────────── */
        .city-card:hover .city-accent {
          width: 100%;
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto container">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How CaaS works
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <div
              key={step.title}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {step.cta && step.href && (
                <Link
                  href={step.href}
                  className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {step.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — COMMUNITY STORIES (Blog)
// ─────────────────────────────────────────────────────────────────────────────

export function CommunityStoriesSection() {
  return (
    <section className="bg-card py-20">
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

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT — all sections composed together
// ─────────────────────────────────────────────────────────────────────────────

export function MeetupHomeSections() {
  return (
    <>
      <HeroSection />
      <NearbyEventsSection />
      <OnlineEventsSection />
      <JoinCTASection />
      <CategoriesSection />
      <PopularCitiesSection />
      <HowItWorksSection />
      <CommunityStoriesSection />
    </>
  );
}
