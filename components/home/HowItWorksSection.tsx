import { Link } from "@/i18n/navigation";
import { ArrowRight, Search, Sparkles, Users } from "lucide-react";

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
