import { Link } from "@/i18n/navigation";
import { ArrowRight, Search, Sparkles, Users } from "lucide-react";
import { Section } from "../section";

const howItWorksSteps = [
  {
    icon: Search,
    title: "Discover events near you",
    description:
      "Browse thousands of events posted by organizations and individuals — from local meetups to large conferences. Find exactly what excites you.",
    cta: "Explore events",
    href: "/events",
  },
  {
    icon: Users,
    title: "Join and connect",
    description:
      "RSVP with one click, connect with attendees who share your interests, and become part of a growing community built around real experiences.",
    cta: null,
    href: null,
  },
  {
    icon: Sparkles,
    title: "Post your own event",
    description:
      "Organizations and individuals can publish events in minutes, reach a targeted audience, and grow their community — all for free.",
    cta: "Post an event",
    href: "/create",
  },
];

export function HowItWorksSection() {
  return (
    <Section className="bg-background py-14 md:py-20">
      <div className="mx-auto container">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How JoinYourEvent works
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Whether you're here to attend or to organize — getting started takes
            less than a minute.
          </p>
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
    </Section>
  );
}
