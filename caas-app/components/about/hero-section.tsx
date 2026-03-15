import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Megaphone, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <Image
        src="/images/hero-pattern.jpg"
        alt=""
        fill
        className="object-cover opacity-30 pointer-events-none"
        priority
      />
      <div className="relative mx-auto container pb-24 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-secondary" />
              Community as a Service — built for organizers &amp; attendees
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Post Events. Build Communities. Grow Together.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              JoinYourEvent.com is the platform where organizations and
              individuals post, discover, and join events that matter — from
              local meetups to large-scale conferences, all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline">
                  Browse events
                </Button>
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Free to join
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Post events instantly
              </span>
            </div>
          </div>

          {/* Right visual — Event overview preview */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Event Overview
                </h3>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                  +38% this month
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <Megaphone className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold text-foreground">124</p>
                  <p className="text-xs text-muted-foreground">Live Events</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <BarChart3 className="mb-2 h-5 w-5 text-secondary" />
                  <p className="text-2xl font-bold text-foreground">8.2K</p>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <TrendingUp className="mb-2 h-5 w-5 text-accent" />
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
              </div>
              {/* Mini chart bars */}
              <div className="mt-6 flex items-end gap-2" aria-hidden="true">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-primary/20"
                      style={{ height: `${h}px` }}
                    >
                      <div
                        className="w-full rounded-t-sm bg-primary transition-all"
                        style={{ height: `${h * 0.7}px` }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-lg md:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    +320 RSVPs today
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across 14 events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
