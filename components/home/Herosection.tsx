"use client";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    label: "Dance class",
    emoji: "💃",
    bg: "from-primary/20 to-primary/5",
    accent: "bg-primary",
  },
  {
    id: 2,
    label: "Speaking club · Every Thursday",
    emoji: "🎤",
    bg: "from-secondary/20 to-secondary/5",
    accent: "bg-secondary",
  },
  {
    id: 3,
    label: "Hiking group · Weekends",
    emoji: "🥾",
    bg: "from-accent/20 to-accent/5",
    accent: "bg-accent",
  },
  {
    id: 4,
    label: "Dance class",
    emoji: "💃",
    bg: "from-primary/20 to-primary/5",
    accent: "bg-primary",
  },
  {
    id: 5,
    label: "Speaking club · Every Thursday",
    emoji: "🎤",
    bg: "from-secondary/20 to-secondary/5",
    accent: "bg-secondary",
  },
  {
    id: 6,
    label: "Hiking group · Weekends",
    emoji: "🥾",
    bg: "from-accent/20 to-accent/5",
    accent: "bg-accent",
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((p) => (p + 1) % slides.length),
      4000,
    );
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <>
      <section className="relative w-full overflow-hidden bg-background">
        <div className="relative mx-auto grid min-h-[100svh] grid-cols-1 items-stretch md:grid-cols-2 md:min-h-[88vh]">
          {/* ── LEFT: Text ──────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-10 md:px-12 lg:px-16 xl:px-24">
            {/* Headline */}
            <h1
              className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl xl:text-6xl"
              style={{ animation: "heroFadeUp 0.7s ease both" }}
            >
              The{" "}
              <span
                className="inline-flex items-center gap-2"
                style={{ animation: "heroFadeUp 0.7s ease 0.1s both" }}
              >
                <span className="hero-icon relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-base sm:h-8 sm:w-8 sm:text-lg">
                  👥
                </span>
                <span className="hero-word">people</span>
              </span>{" "}
              platform. <br className="hidden md:block" />
              Where{" "}
              <span
                className="inline-flex items-center gap-2"
                style={{ animation: "heroFadeUp 0.7s ease 0.22s both" }}
              >
                <span className="hero-icon relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-base sm:h-8 sm:w-8 sm:text-lg">
                  ⚡
                </span>
                <span className="hero-word">interests</span>
              </span>{" "}
              become{" "}
              <span
                className="inline-flex items-center gap-2"
                style={{ animation: "heroFadeUp 0.7s ease 0.34s both" }}
              >
                <span className="hero-icon relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-base sm:h-8 sm:w-8 sm:text-lg">
                  ❤️
                </span>
                <span className="hero-word">friendships.</span>
              </span>
            </h1>

            {/* Body */}
            <p
              className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
              style={{ animation: "heroFadeUp 0.7s ease 0.46s both" }}
            >
              Whatever your interest, from hiking and reading to networking and
              skill sharing, there are thousands of people who share it on CaaS.
              Events are happening every day—sign up to join the fun.
            </p>

            {/* CTA */}
            <div style={{ animation: "heroFadeUp 0.7s ease 0.58s both" }}>
              <Link href="/register">
                <Button
                  size="lg"
                  className="hero-btn gap-2 rounded-full px-6 text-sm sm:px-8 sm:text-base"
                >
                  Join CaaS
                  <ArrowRight className="hero-arrow h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Slide visual ─────────────────────────────────────── */}
          {/*
            Mobile: fixed aspect-ratio box so it doesn't take full screen height.
            md+: stretches to fill the grid row height.
          */}
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-auto">
            {/* Slide background */}
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`}
            />

            {/* Large emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="select-none text-[80px] opacity-30 transition-all duration-500 sm:text-[120px] md:text-[160px]"
                aria-hidden
              >
                {slide.emoji}
              </span>
            </div>

            {/* Label pill — bottom left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full border border-border bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm sm:bottom-8 sm:left-6 sm:px-5 sm:py-3">
              <span
                className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${slide.accent}`}
              />
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {slide.label}
              </span>
            </div>

            {/* Arrows — bottom right */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 sm:bottom-8 sm:right-6 sm:gap-2">
              <button
                onClick={prev}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card sm:h-9 sm:w-9"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={next}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card sm:h-9 sm:w-9"
                aria-label="Next slide"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Dot indicators — right edge, hidden on very small screens */}
            <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 sm:flex sm:right-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-all",
                    i === current
                      ? "scale-150 bg-foreground"
                      : "bg-muted-foreground/40",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* Left fade — only on md+ where it blends into the text column */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent md:w-16" />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-icon {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
        }
        .hero-icon:hover {
          transform: scale(2.25) rotate(-12deg);
        }
        .hero-word {
          position: relative;
          display: inline-block;
          transition: color 0.2s ease;
        }
        .hero-word::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 2px;
          background: hsl(var(--primary));
          border-radius: 999px;
          transition: width 0.3s ease;
        }
        .hero-word:hover::after { width: 100%; }
        .hero-btn .hero-arrow { transition: transform 0.2s ease; }
        .hero-btn:hover .hero-arrow { transform: translateX(4px); }
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
          50%       { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .hero-icon:nth-child(1) { animation: heroPulse 3s ease-in-out infinite; }
      `}</style>
    </>
  );
}
