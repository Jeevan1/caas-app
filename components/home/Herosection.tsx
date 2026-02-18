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

  // Auto-rotate slides every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <>
      <section className="relative w-full overflow-hidden bg-background">
        <div className="relative mx-auto grid min-h-[88vh] grid-cols-1 items-center gap-0 md:grid-cols-2">
          {/* ── LEFT: Text ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-7 px-8 py-16 ps-20 lg:ps-64">
            {/* Headline */}
            <h1
              className="font-heading text-xl font-bold leading-[1.05] tracking-tight text-foreground md:text-2xl lg:text-4xl text-balance"
              style={{ animation: "heroFadeUp 0.7s ease both" }}
            >
              The{" "}
              <span
                className="inline-flex items-center gap-2"
                style={{ animation: "heroFadeUp 0.7s ease 0.1s both" }}
              >
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg hero-icon">
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
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-lg hero-icon">
                  ⚡
                </span>
                <span className="hero-word">interests</span>
              </span>{" "}
              become{" "}
              <span
                className="inline-flex items-center gap-2"
                style={{ animation: "heroFadeUp 0.7s ease 0.34s both" }}
              >
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-lg hero-icon">
                  ❤️
                </span>
                <span className="hero-word">friendships.</span>
              </span>
            </h1>

            {/* Body */}
            <p
              className="max-w-md text-md leading-relaxed text-muted-foreground"
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
                  className="gap-2 rounded-full px-8 text-base hero-btn"
                >
                  Join CaaS
                  <ArrowRight className="h-4 w-4 hero-arrow" />
                </Button>
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Rotating slide visual ────────────────────────────────── */}
          <div className="relative h-[92vh] w-full overflow-hidden">
            {/* Slide background */}
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`}
            />

            {/* Large emoji / illustration centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="select-none text-[120px] opacity-30 transition-all duration-500 md:text-[180px]"
                aria-hidden
              >
                {slide.emoji}
              </span>
            </div>

            {/* Slide label pill — bottom left (like Meetup's event label) */}
            <div className="absolute bottom-10 left-8 flex items-center gap-3 rounded-full border border-border bg-card/90 px-5 py-3 shadow-lg backdrop-blur-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${slide.accent}`} />
              <span className="text-sm font-semibold text-foreground">
                {slide.label}
              </span>
            </div>

            {/* Slide nav arrows */}
            <div className="absolute bottom-10 right-8 flex items-center gap-2">
              <button
                onClick={prev}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === current
                      ? "scale-150 bg-foreground"
                      : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>

            {/* Soft left-edge fade so text side blends */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          </div>
        </div>
      </section>
      {/* ── KEYFRAMES + MICRO-INTERACTIONS ────────────────────────────────── */}
      <style>{`
        /* Entrance */
        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Icon bounce on hover */
        .hero-icon {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
        }
        .hero-icon:hover {
          transform: scale(2.25) rotate(-12deg);
        }

        /* Word highlight sweep on hover */
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
        .hero-word:hover::after {
          width: 100%;
        }

        /* CTA button arrow slide */
        .hero-btn .hero-arrow {
          transition: transform 0.2s ease;
        }
        .hero-btn:hover .hero-arrow {
          transform: translateX(4px);
        }

        /* Subtle pulse on the icon circles */
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
          50%       { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .hero-icon:nth-child(1) { animation: heroPulse 3s ease-in-out infinite; }
      `}</style>
    </>
  );
}
