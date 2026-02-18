import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Megaphone, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-secondary" />
              Now with AI-powered campaign optimization
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Promote Your Business Like a Pro
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Easily manage campaigns, track results, and grow your audience
              with affordable, DIY marketing tools built for entrepreneurs.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                No credit card required
              </span>
            </div>
          </div>

          {/* Right visual - Dashboard preview */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Campaign Overview</h3>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                  +24% this month
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <Megaphone className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Active Campaigns</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <BarChart3 className="mb-2 h-5 w-5 text-secondary" />
                  <p className="text-2xl font-bold text-foreground">3.4K</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <TrendingUp className="mb-2 h-5 w-5 text-accent" />
                  <p className="text-2xl font-bold text-foreground">847</p>
                  <p className="text-xs text-muted-foreground">New Leads</p>
                </div>
              </div>
              {/* Mini chart bars */}
              <div className="mt-6 flex items-end gap-2" aria-hidden="true">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
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
                ))}
              </div>
            </div>
            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-lg md:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">+150 leads</p>
                  <p className="text-xs text-muted-foreground">From email campaign</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
