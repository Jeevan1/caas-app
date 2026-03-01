import { CTASection } from "@/components/about/cta-section";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CalendarPlus,
  Ticket,
  BarChart3,
  ArrowRight,
  Music,
  Briefcase,
  GraduationCap,
  Heart,
  Utensils,
  Trophy,
} from "lucide-react";

export const metadata = {
  title: "How It Works - EventHub",
  description:
    "Learn how EventHub helps you create, manage, sell tickets, and grow your events in four simple steps.",
};

const detailedSteps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Organizer Account",
    description:
      "Sign up in seconds and set up your organizer profile. Add your brand, bio, and contact details so attendees know exactly who's behind the event.",
    features: [
      "Quick email or OAuth sign-up",
      "Organizer profile with logo & bio",
      "Connect payment accounts",
      "Set your timezone and currency",
    ],
  },
  {
    icon: CalendarPlus,
    step: "02",
    title: "Build & Publish Your Event",
    description:
      "Use our intuitive event builder to add every detail — date, venue, schedule, speakers, and more. Choose a stunning page template and go live in minutes.",
    features: [
      "Drag-and-drop event page builder",
      "Add agenda, speakers & sponsors",
      "Custom branding and cover images",
      "Publish publicly or as invite-only",
    ],
  },
  {
    icon: Ticket,
    step: "03",
    title: "Sell Tickets & Manage RSVPs",
    description:
      "Create free or paid ticket tiers, set capacity limits, and let attendees register with ease. Automated confirmations and QR-code check-in are handled for you.",
    features: [
      "Free, paid, and VIP ticket tiers",
      "Promo codes and early-bird pricing",
      "Automated confirmation emails",
      "QR-code check-in app included",
    ],
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Track Registrations & Grow",
    description:
      "Monitor ticket sales, attendee demographics, and revenue in real time. Use insights to improve future events and build a loyal audience over time.",
    features: [
      "Real-time sales & revenue dashboard",
      "Attendee demographics & check-in stats",
      "Post-event surveys and feedback",
      "Audience re-engagement tools",
    ],
  },
];

const eventTypes = [
  {
    icon: Music,
    title: "Concerts & Live Shows",
    description:
      "Sell tickets, manage venue capacity, and engage fans before, during, and after the show.",
  },
  {
    icon: Briefcase,
    title: "Conferences & Summits",
    description:
      "Handle multi-day agendas, speaker lineups, sponsor tiers, and badge check-in at scale.",
  },
  {
    icon: GraduationCap,
    title: "Workshops & Classes",
    description:
      "Run paid or free learning sessions with seat limits, waitlists, and follow-up materials.",
  },
  {
    icon: Heart,
    title: "Fundraisers & Galas",
    description:
      "Collect donations, sell tables, and track fundraising goals all in one place.",
  },
  {
    icon: Utensils,
    title: "Food & Drink Events",
    description:
      "Manage tasting events, pop-ups, and supper clubs with timed entry and session ticketing.",
  },
  {
    icon: Trophy,
    title: "Sports & Tournaments",
    description:
      "Coordinate registrations, brackets, and spectator tickets for any competitive event.",
  },
];

export default function HowItWorksPage() {
  return (
    <section>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background py-14 md:py-20">
        <div className="container mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                How It Works
              </p>
              <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Your event, live in minutes
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground lg:mx-0">
                EventHub gives organizers everything they need to create
                unforgettable experiences — from the first ticket sale to
                post-event insights.
              </p>
            </div>
            <div className="relative mx-auto h-64 w-full max-w-md overflow-hidden rounded-2xl lg:h-80">
              <Image
                src="/images/how-it-works-hero.jpg"
                alt="Event organizer managing an event on a laptop"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── DETAILED STEPS ───────────────────────────────────────────────── */}
      <section className="bg-card py-20 md:py-24">
        <div className="container mx-auto">
          <div className="flex flex-col gap-16">
            {detailedSteps.map((item, index) => (
              <div
                key={item.step}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  index % 2 !== 0 ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div className={index % 2 !== 0 ? "lg:[direction:ltr]" : ""}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="mb-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {item.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
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
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual card */}
                <div
                  className={`rounded-2xl border border-border bg-background p-8 ${
                    index % 2 !== 0 ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                      <item.icon className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-center text-lg font-semibold text-foreground">
                      {item.title}
                    </p>
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${25 * (index + 1)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {`${25 * (index + 1)}% complete`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENT TYPES ──────────────────────────────────────────────────── */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center md:mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Event Types
            </p>
            <h2 className="text-balance font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Built for every kind of event
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you're hosting 20 people or 20,000, EventHub scales to fit
              any format, industry, or audience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((et) => (
              <div
                key={et.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <et.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {et.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {et.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Create Your First Event
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </section>
  );
}
