"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Heart,
  MapPin,
  MousePointerClick,
  Share2,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const campaign = {
  title: "Startup Pitch Night & Networking",
  group: "Entrepreneurs of Kathmandu",
  groupInitials: "EK",
  category: "Career & Business",
  date: "Thu, Feb 20, 2026",
  time: "6:00 – 9:00 PM",
  location: "Thamel Business Hub, Kathmandu",
  emoji: "🚀",
  description: `An electrifying evening of startup pitches and real conversations with founders who've been in the trenches. Expect 5-minute pitches from 6 early-stage startups, followed by open networking with investors, mentors, and builders.`,
  attendees: 42,
  maxAttendees: 60,
  organizer: "Aarav Karki",
  organizerRole: "Founder & Organizer",
  tags: ["Startup", "Networking", "Tech"],
  stats: { views: 1240, clicks: 387, leads: 42, conversion: "3.4%" },
  rating: 4.8,
  reviews: 24,
};

const relatedEvents = [
  {
    title: "Digital Marketing Masterclass",
    date: "Sun, Feb 23",
    attendees: 89,
    emoji: "📊",
  },
  {
    title: "Book Club: The Lean Startup",
    date: "Wed, Feb 19",
    attendees: 18,
    emoji: "📚",
  },
  {
    title: "Photography Walk: Thamel",
    date: "Sat, Feb 22",
    attendees: 23,
    emoji: "📸",
  },
];

const chartBars = [28, 45, 38, 72, 55, 88, 65, 91, 74, 85, 78, 95];

export default function EventDetails() {
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [tab, setTab] = useState<"about" | "stats" | "attendees">("about");
  const [showBar, setShowBar] = useState(false);
  const joinCardRef = useRef<HTMLDivElement>(null);
  const progress = (campaign.attendees / campaign.maxAttendees) * 100;

  // Show sticky bar when join card is out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    if (joinCardRef.current) observer.observe(joinCardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ animation: "dp 0.4s ease both" }}
      >
        <div className="mx-auto flex container items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Events
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`ib flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition-all ${liked ? "border-red-300 text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500" : ""}`} />
            </button>
            <button className="ib flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto container px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="flex flex-col gap-8">
            {/* Hero */}
            <div
              className="relative flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/8 via-muted to-secondary/8 md:h-72"
              style={{ animation: "du 0.55s ease 0.05s both" }}
            >
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <span className="hero-em select-none text-[130px] md:text-[160px]">
                {campaign.emoji}
              </span>
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
                  {campaign.category}
                </span>
                <span className="rounded-full bg-secondary/80 px-3 py-1 text-[11px] font-semibold text-secondary-foreground backdrop-blur-sm">
                  In Person
                </span>
              </div>
            </div>

            {/* Title */}
            <div style={{ animation: "du 0.55s ease 0.12s both" }}>
              <div className="mb-3 flex gap-1.5">
                {campaign.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {campaign.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4">
                {[
                  {
                    icon: Calendar,
                    text: campaign.date,
                    color: "text-primary",
                  },
                  { icon: Clock, text: campaign.time, color: "text-secondary" },
                  {
                    icon: MapPin,
                    text: campaign.location,
                    color: "text-accent",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    {text}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.floor(campaign.rating) ? "fill-accent text-accent" : "text-border"}`}
                  />
                ))}
                <span className="text-xs font-semibold text-foreground">
                  {campaign.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({campaign.reviews})
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ animation: "du 0.55s ease 0.19s both" }}>
              <div className="flex gap-0.5 rounded-xl border border-border bg-muted p-1">
                {(["about", "stats", "attendees"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "about" && (
                <div className="tc mt-5 flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {campaign.description}
                  </p>
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {campaign.groupInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {campaign.organizer}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {campaign.organizerRole} · {campaign.group}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto shrink-0 rounded-full text-xs h-7 px-3"
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              )}

              {tab === "stats" && (
                <div className="tc mt-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        icon: Eye,
                        label: "Views",
                        value: "1,240",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        icon: MousePointerClick,
                        label: "Clicks",
                        value: "387",
                        color: "text-secondary",
                        bg: "bg-secondary/10",
                      },
                      {
                        icon: Users,
                        label: "Leads",
                        value: "42",
                        color: "text-accent",
                        bg: "bg-accent/10",
                      },
                      {
                        icon: TrendingUp,
                        label: "Conversion",
                        value: "3.4%",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                    ].map((s, i) => (
                      <div
                        key={s.label}
                        className="sc flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4"
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}
                        >
                          <s.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {s.value}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Views · Last 12 months
                    </p>
                    <div className="flex items-end gap-1 h-20">
                      {chartBars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col justify-end"
                        >
                          <div
                            className="w-full rounded-t-sm bg-primary/12"
                            style={{ height: `${h}%` }}
                          >
                            <div
                              className="bc w-full rounded-t-sm bg-primary"
                              style={{
                                height: "70%",
                                animationDelay: `${i * 0.04}s`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                      <span>Jan</span>
                      <span>Jun</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              )}

              {tab === "attendees" && (
                <div className="tc mt-5 flex flex-col gap-2">
                  {[
                    {
                      initials: "AK",
                      name: "Aarav K.",
                      role: "Founder",
                      color: "primary",
                    },
                    {
                      initials: "MJ",
                      name: "Mina J.",
                      role: "Designer",
                      color: "secondary",
                    },
                    {
                      initials: "SR",
                      name: "Sita R.",
                      role: "Developer",
                      color: "accent",
                    },
                    {
                      initials: "PB",
                      name: "Prem B.",
                      role: "Marketer",
                      color: "primary",
                    },
                    {
                      initials: "RC",
                      name: "Ravi C.",
                      role: "Investor",
                      color: "secondary",
                    },
                    {
                      initials: "DT",
                      name: "Devi T.",
                      role: "Mentor",
                      color: "accent",
                    },
                  ].map((a, i) => (
                    <div
                      key={a.name}
                      className="ac flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground"
                        style={{ background: `hsl(var(--${a.color}))` }}
                      >
                        {a.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {a.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.role}
                        </p>
                      </div>
                      <CheckCircle2 className="ml-auto h-4 w-4 text-secondary" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related */}
            <div style={{ animation: "du 0.55s ease 0.26s both" }}>
              <p className="mb-4 text-sm font-bold text-foreground">
                You might also like
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedEvents.map((ev, i) => (
                  <Link
                    key={ev.title}
                    href="#"
                    className="rc group flex flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="flex h-16 items-center justify-center bg-muted text-3xl">
                      {ev.emoji}
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {ev.title}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ev.attendees}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div
            className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start"
            style={{ animation: "du 0.55s ease 0.16s both" }}
          >
            {/* Join card — observed */}
            <div
              ref={joinCardRef}
              className="jcard overflow-hidden rounded-3xl border border-border bg-card shadow-md"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-secondary/12 px-3 py-1 text-xs font-bold text-secondary">
                    Free
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Zap className="h-3 w-3 text-accent" /> Filling fast
                  </span>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {campaign.attendees} attending
                    </span>
                    <span className="text-muted-foreground">
                      {campaign.maxAttendees - campaign.attendees} left
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="pb h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[
                        "primary",
                        "secondary",
                        "accent",
                        "primary",
                        "secondary",
                      ].map((c, i) => (
                        <div
                          key={i}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground"
                          style={{ background: `hsl(var(--${c}))` }}
                        >
                          {["A", "M", "S", "P", "R"][i]}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      +37 others joined
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 rounded-xl bg-muted/50 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {campaign.date}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {campaign.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {campaign.location}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        View on map →
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setJoined(!joined)}
                  className={`jbtn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${joined ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {joined ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> You&apos;re in!
                    </>
                  ) : (
                    <>
                      Join this event <ArrowRight className="h-4 w-4 ja" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Free · No credit card required
                </p>
              </div>
            </div>

            {/* Organizer */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Organized by
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {campaign.groupInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {campaign.group}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Globe className="h-3 w-3" /> Public group
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ["48", "Events"],
                  ["1.2K", "Members"],
                  ["4.9", "Rating"],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="rounded-lg bg-muted/60 py-2">
                    <p className="text-sm font-bold text-foreground">{val}</p>
                    <p className="text-[10px] text-muted-foreground">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold text-foreground">
                Share
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["𝕏", "X"],
                  ["in", "LinkedIn"],
                  ["f", "Facebook"],
                  ["🔗", "Copy"],
                ].map(([icon, lbl]) => (
                  <button
                    key={lbl}
                    className="sb flex flex-col items-center gap-1 rounded-xl border border-border bg-muted py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="text-[9px]">{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ──────────────────────────────────────────────
           Slides up from bottom when join card scrolls out of view.      */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]
        ${showBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      >
        {/* Frosted glass panel */}
        <div className="border-t border-border bg-card/90 backdrop-blur-xl shadow-[0_-8px_40px_-4px_hsl(var(--foreground)/0.1)]">
          {/* Gradient top line */}
          <div className="h-[2px] bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="mx-auto container px-6 py-3">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Event emoji + title */}
              <div className="flex items-center gap-3 min-w-0 shrink-0">
                <span className="text-2xl leading-none">{campaign.emoji}</span>
                <div className="hidden sm:block min-w-0">
                  <p className="truncate text-sm font-bold text-foreground leading-tight">
                    {campaign.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Free · {campaign.attendees} attending
                  </p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

              {/* Info pills — stagger in */}
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span
                  className={`pill-1 flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground whitespace-nowrap
                  ${showBar ? "pill-in" : ""}`}
                  style={{ animationDelay: "0.06s" }}
                >
                  <Calendar className="h-3 w-3 text-primary shrink-0" />
                  {campaign.date}
                </span>
                <span
                  className={`pill-2 flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground whitespace-nowrap
                  ${showBar ? "pill-in" : ""}`}
                  style={{ animationDelay: "0.13s" }}
                >
                  <Clock className="h-3 w-3 text-secondary shrink-0" />
                  {campaign.time}
                </span>
                <span
                  className={`pill-3 hidden md:flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground whitespace-nowrap
                  ${showBar ? "pill-in" : ""}`}
                  style={{ animationDelay: "0.20s" }}
                >
                  <MapPin className="h-3 w-3 text-accent shrink-0" />
                  {campaign.location}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={() => setJoined(!joined)}
                className={`bar-btn shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                  ${joined ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {joined ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Joined
                  </>
                ) : (
                  <>
                    Join <ArrowRight className="h-4 w-4 bar-arrow" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind bar */}
      {showBar && <div className="h-20" />}

      <style>{`
        @keyframes du  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes dp  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes pip { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:none} }

        .hero-em { animation: hf 5s ease-in-out infinite; }
        @keyframes hf { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }

        .tc  { animation: du 0.3s ease both; }
        .sc  { animation: du 0.4s ease both; transition:transform .2s ease,box-shadow .2s ease; }
        .sc:hover { transform:translateY(-3px); box-shadow:0 8px 20px -4px hsl(var(--foreground)/.07); }
        .bc  { animation: bcg 0.7s ease both; }
        @keyframes bcg { from{height:0} to{height:70%} }
        .ac  { animation: du 0.35s ease both; transition:transform .18s ease; }
        .ac:hover { transform:translateX(3px); }
        .rc  { animation: du 0.4s ease both; }
        .pb  { animation: pbg 1s cubic-bezier(.34,1.2,.64,1) .5s both; }
        @keyframes pbg { from{width:0} }

        .jcard { transition:box-shadow .3s ease; }
        .jcard:hover { box-shadow:0 16px 48px -10px hsl(var(--primary)/.12); }
        .jbtn { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
        .jbtn:hover { transform:translateY(-2px) scale(1.01); box-shadow:0 10px 28px -6px hsl(var(--primary)/.3); }
        .ja  { transition:transform .18s ease; }
        .jbtn:hover .ja { transform:translateX(3px); }
        .ib  { transition:transform .2s cubic-bezier(.34,1.56,.64,1); }
        .ib:hover { transform:scale(1.12); }
        .sb  { transition:transform .2s cubic-bezier(.34,1.56,.64,1); }
        .sb:hover { transform:translateY(-2px); }

        /* Pills stagger in when bar appears */
        .pill-in { animation: pip 0.4s ease both; }

        /* Bar CTA */
        .bar-btn { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
        .bar-btn:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 8px 20px -4px hsl(var(--primary)/.35); }
        .bar-arrow { transition:transform .18s ease; }
        .bar-btn:hover .bar-arrow { transform:translateX(3px); }
      `}</style>
    </div>
  );
}
