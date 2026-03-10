"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  MapPin,
  Mountain,
  Quote,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const heroTopics = [
  {
    label: "Hiking",
    emoji: "🥾",
    bg: "from-emerald-900/80 via-emerald-800/60",
    href: "#",
  },
  {
    label: "Outdoor Fitness",
    emoji: "🏃",
    bg: "from-orange-900/80 via-orange-800/60",
    href: "#",
  },
  {
    label: "Weekend Adventure",
    emoji: "⛺",
    bg: "from-sky-900/80 via-sky-800/60",
    href: "#",
  },
];

const popularTopics = [
  { label: "Camping", emoji: "🏕️", count: "2.4K groups" },
  { label: "International Travel", emoji: "✈️", count: "1.8K groups" },
  { label: "Bicycling", emoji: "🚴", count: "3.1K groups" },
  { label: "Backpacking", emoji: "🎒", count: "890 groups" },
  { label: "Kayaking", emoji: "🛶", count: "640 groups" },
];

const popularGroups = [
  {
    name: "Kathmandu Hikers",
    members: 1240,
    events: 48,
    emoji: "🏔️",
    tags: ["Hiking", "Nature"],
  },
  {
    name: "Adventure Seekers Nepal",
    members: 890,
    events: 31,
    emoji: "🧗",
    tags: ["Climbing", "Adventure"],
  },
  {
    name: "Weekend Wanderers",
    members: 2100,
    events: 72,
    emoji: "🌄",
    tags: ["Travel", "Outdoors"],
  },
  {
    name: "Trail Runners KTM",
    members: 560,
    events: 26,
    emoji: "🏃",
    tags: ["Running", "Fitness"],
  },
];

const upcomingEvents = [
  {
    title: "Morning Hike: Shivapuri Peak",
    date: "Sat, Feb 22",
    time: "6:00 AM",
    attendees: 28,
    emoji: "🌅",
    type: "In Person",
  },
  {
    title: "Cycling Tour: Nagarkot Loop",
    date: "Sun, Feb 23",
    time: "7:00 AM",
    attendees: 14,
    emoji: "🚴",
    type: "In Person",
  },
  {
    title: "Intro to Rock Climbing Workshop",
    date: "Mon, Feb 24",
    time: "5:00 PM",
    attendees: 12,
    emoji: "🧗",
    type: "In Person",
  },
  {
    title: "Online: Plan Your Nepal Trek",
    date: "Tue, Feb 25",
    time: "7:00 PM",
    attendees: 44,
    emoji: "🗺️",
    type: "Online",
  },
];

const steps = [
  {
    n: "01",
    title: "Find your activity",
    body: "Search hiking, biking, kayaking — whatever excites you outdoors.",
    emoji: "🔍",
  },
  {
    n: "02",
    title: "Attend an event",
    body: "Show up, breathe fresh air, and explore new trails with locals.",
    emoji: "📍",
  },
  {
    n: "03",
    title: "Make real friends",
    body: "Repeat the experience. Friendship takes time — keep showing up.",
    emoji: "🤝",
  },
  {
    n: "04",
    title: "Lead your own",
    body: "Ready to host? Start your own outdoor group and build community.",
    emoji: "⛰️",
  },
];

const stories = [
  {
    title: "The Trek That Changed Everything",
    excerpt: "How a solo hiker found lifelong friends on a Himalayan trail.",
    emoji: "🏔️",
    read: "4 min",
  },
  {
    title: "From Couch to Trail Runner",
    excerpt:
      "One member's journey from zero fitness to completing her first 10K.",
    emoji: "🏃",
    read: "3 min",
  },
  {
    title: "Why I Solo Travel (And You Should)",
    excerpt: "Solo travel doesn't mean being alone. It means total freedom.",
    emoji: "✈️",
    read: "5 min",
  },
];

// ─── INTERSECTION HOOK ────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(0.34,1.1,0.64,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const [activeHero, setActiveHero] = useState(0);

  // Auto-rotate hero tabs
  useEffect(() => {
    const t = setInterval(
      () => setActiveHero((p) => (p + 1) % heroTopics.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] overflow-hidden">
        {/* Animated gradient background per active topic */}
        {heroTopics.map((t, i) => (
          <div
            key={t.label}
            className={`absolute inset-0 bg-gradient-to-br ${t.bg} to-background transition-opacity duration-700`}
            style={{ opacity: activeHero === i ? 1 : 0 }}
          />
        ))}

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating emoji blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {["🌲", "🏔️", "🌊", "⛺", "🦅", "🌄"].map((em, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-10"
              style={{
                left: `${[8, 25, 60, 75, 15, 85][i]}%`,
                top: `${[20, 65, 15, 70, 45, 35][i]}%`,
                animation: `floatBlob ${5 + i * 1.3}s ease-in-out ${i * 0.7}s infinite alternate`,
              }}
            >
              {em}
            </span>
          ))}
        </div>

        <div className="relative mx-auto container px-6 pt-28 pb-16">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left — copy */}
            <div
              className="flex flex-col gap-6"
              style={{ animation: "heroUp 0.7s ease both" }}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
                <Mountain className="h-3.5 w-3.5 text-secondary" />
                Travel & Outdoor
              </div>

              <h1 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
                Go further,
                <br />
                <span className="text-secondary">together.</span>
              </h1>

              <p className="max-w-md text-lg text-primary-foreground/75 leading-relaxed">
                From mountain hikes to coastal kayaks — find outdoor groups,
                join adventures, and make friends who love the wild as much as
                you do.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="#">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full bg-primary-foreground text-background hover:bg-primary-foreground/90 px-8"
                  >
                    Explore groups <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8"
                  >
                    Browse events
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 pt-4 border-t border-primary-foreground/10">
                {[
                  ["50K+", "Members"],
                  ["12K+", "Events/mo"],
                  ["200+", "Cities"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="font-heading text-2xl font-bold text-primary-foreground">
                      {v}
                    </p>
                    <p className="text-xs text-primary-foreground/60">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — topic image cards */}
            <div
              className="relative flex flex-col gap-3"
              style={{ animation: "heroUp 0.7s ease 0.15s both" }}
            >
              {heroTopics.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setActiveHero(i)}
                  className={`group relative flex items-center gap-5 overflow-hidden rounded-2xl border px-6 py-5 text-left transition-all duration-300
                    ${
                      activeHero === i
                        ? "border-primary-foreground/30 bg-primary-foreground/15 backdrop-blur-sm shadow-lg scale-[1.02]"
                        : "border-primary-foreground/10 bg-primary-foreground/5 hover:bg-primary-foreground/10"
                    }`}
                >
                  <span
                    className={`text-4xl transition-transform duration-300 ${activeHero === i ? "scale-110" : "group-hover:scale-105"}`}
                  >
                    {t.emoji}
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold text-primary-foreground">
                      {t.label}
                    </p>
                    <p className="text-xs text-primary-foreground/60">
                      Explore {t.label.toLowerCase()} groups →
                    </p>
                  </div>
                  {/* Active indicator */}
                  {activeHero === i && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-secondary" />
                  )}
                  {/* Progress bar for active */}
                  {activeHero === i && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-secondary hero-progress" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* ══ 2. FIND & MAKE FRIENDS ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-24">
        <div className="mx-auto container px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: "🗺️",
                title: "Find outdoor activities near you",
                body: "Join groups for hiking, biking, rock climbing and kayaking. Make friends with people who love what you love.",
                cta: "Join groups",
                color: "from-secondary/10 to-primary/5",
                border: "border-secondary/20",
              },
              {
                icon: "⛰️",
                title: "Go on an outdoor adventure",
                body: "Breathe fresh air and explore new trails. Find outdoor group activities and meet like-minded locals.",
                cta: "Discover adventure",
                color: "from-accent/10 to-secondary/5",
                border: "border-accent/20",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.12}>
                <div
                  className={`find-card group relative overflow-hidden rounded-3xl border ${card.border} bg-gradient-to-br ${card.color} p-8 transition-all hover:shadow-xl`}
                >
                  <span className="text-5xl">{card.icon}</span>
                  <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                  <Link
                    href="#"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {card.cta}{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  {/* Corner decoration */}
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-foreground/[0.03]" />
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-foreground/[0.04]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. POPULAR GROUPS ════════════════════════════════════════════════ */}
      <section className="bg-card py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Reveal>
            <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Community
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Popular outdoor groups
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Find outdoor group activities and meet like-minded
                  adventurers.
                </p>
              </div>
              <Link
                href="#"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
              >
                See all groups <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularGroups.map((g, i) => (
              <Reveal key={g.name} delay={i * 0.08}>
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. POPULAR TOPICS ════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Explore
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Popular topics
              </h2>
              <p className="mt-2 text-muted-foreground">
                Browse by the activity that excites you most.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {popularTopics.map((t, i) => (
              <Reveal key={t.label} delay={i * 0.07}>
                <Link
                  href="#"
                  className="topic-card group relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-border bg-card py-8 px-4 text-center transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <span className="topic-emoji text-4xl transition-transform duration-300 group-hover:scale-125">
                    {t.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {t.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {t.count}
                    </p>
                  </div>
                  {/* Hover fill */}
                  <div className="topic-fill absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04] rounded-3xl" />
                  {/* Bottom line */}
                  <div className="topic-line absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-10" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. UPCOMING EVENTS ═══════════════════════════════════════════════ */}
      <section className="bg-card py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Reveal>
            <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  What's on
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Upcoming events
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Thousands of outdoor events happening every day.
                </p>
              </div>
              <Link
                href="#"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
              >
                All events <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            {upcomingEvents.map((ev, i) => (
              <Reveal key={ev.title} delay={i * 0.07}>
                <Link
                  href="#"
                  className="event-row group flex items-center gap-5 rounded-2xl border border-border bg-background px-5 py-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  {/* Emoji */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl transition-transform duration-200 group-hover:scale-110">
                    {ev.emoji}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {ev.title}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-secondary" />
                        {ev.date}
                      </span>
                      <span>{ev.time}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        {ev.attendees} going
                      </span>
                    </div>
                  </div>
                  {/* Type badge */}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold
                    ${ev.type === "Online" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}
                  >
                    {ev.type}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28">
        {/* Background */}
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
          <Reveal>
            <div className="mb-12 md:mb-16 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                How it works
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Tips to meet new friends outdoors
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="step-card relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  {/* Number */}
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
                  {/* Connector line on desktop */}
                  {i < steps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. TESTIMONIAL ═══════════════════════════════════════════════════ */}
      <section className="bg-card py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Reveal>
            <div className="relative mx-auto max-w-2xl rounded-3xl border border-border bg-background p-10 text-center shadow-sm">
              {/* Quote mark */}
              <Quote className="mx-auto mb-6 h-10 w-10 text-primary/20" />
              <blockquote className="font-heading text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
                "As hard as it is to make new friends as an adult, it's
                profoundly easier when you share something in common. That's the
                beauty of CaaS!"
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                  BS
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    Brianna Stryker
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CaaS member · Outdoor enthusiast
                  </p>
                </div>
              </div>
              {/* Stars */}
              <div className="mt-4 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              {/* Decorative blobs */}
              <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-primary/5" />
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-secondary/5" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 8. MEMBER STORIES ════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24">
        <div className="mx-auto container px-6">
          <Reveal>
            <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Inspiration
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Stories from members
                </h2>
              </div>
              <Link
                href="#"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
              >
                Read more <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-3">
            {stories.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <Link
                  href="#"
                  className="story-card group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-xl"
                >
                  {/* Image area */}
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
                    <span className="story-emoji text-7xl opacity-30 transition-all duration-500 group-hover:scale-125 group-hover:opacity-50 select-none">
                      {s.emoji}
                    </span>
                    {/* Read time chip */}
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                      <BookOpen className="h-3 w-3" /> {s.read}
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. BOTTOM CTA ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary py-28">
        {/* Animated orbs */}
        <div className="cta-orb-1 absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="cta-orb-2 absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <p className="mb-3 text-4xl">🏔️</p>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl text-balance">
              Create your own outdoor group
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-primary-foreground/75">
              Ready to lead? Start a group, plan events, and build a community
              of adventurers around you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="#">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-primary-foreground text-background hover:bg-primary-foreground/90 px-8"
                >
                  Start a new group <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ STYLES ═══════════════════════════════════════════════════════════ */}
      <style>{`
        /* Hero entrance */
        @keyframes heroUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:none; }
        }

        /* Floating background blobs */
        @keyframes floatBlob {
          from { transform:translateY(0) rotate(0deg) scale(1); }
          to   { transform:translateY(-20px) rotate(8deg) scale(1.1); }
        }

        /* Hero progress bar */
        .hero-progress {
          animation: progressBar 3.5s linear both;
        }
        @keyframes progressBar {
          from { width:0%; }
          to   { width:100%; }
        }

        /* Card hovers */
        .find-card {
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease;
        }
        .find-card:hover { transform: translateY(-4px); }

        .group-card {
          transition: transform 0.22s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .group-card:hover { transform: translateY(-4px); }

        .topic-card {
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .topic-card:hover { transform: translateY(-6px); }

        .event-row {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .event-row:hover { transform: translateX(4px); }

        .step-card {
          transition: transform 0.22s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.22s ease;
        }
        .step-card:hover { transform: translateY(-4px); }

        .story-card {
          transition: transform 0.28s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.28s ease;
        }
        .story-card:hover { transform: translateY(-6px) scale(1.01); }

        /* Hero topic card active scale */
        .hero-topic-active { transform: scale(1.02); }

        /* Bottom CTA orb float */
        .cta-orb-1 { animation: orb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation: orb2 11s ease-in-out infinite; }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-16px,20px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-16px)} }
      `}</style>
    </div>
  );
}
