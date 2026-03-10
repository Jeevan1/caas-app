import {
  BarChart3,
  Layout,
  Trophy,
  Bell,
  CreditCard,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Campaign Management",
    description:
      "Create, schedule, and manage campaigns for events, products, or services all from one place.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track views, clicks, and leads with beautiful charts and reports. Know what works instantly.",
  },
  {
    icon: Trophy,
    title: "Gamification & Rewards",
    description:
      "Earn points for successful campaigns. Climb the leaderboard and unlock badges and rewards.",
  },
  {
    icon: Users,
    title: "Marketing Templates",
    description:
      "Access a library of pre-built templates for social media, email, flyers, and more.",
  },
  {
    icon: CreditCard,
    title: "Flexible Pricing",
    description:
      "Start free with basic campaigns or upgrade for unlimited access and premium features.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Get notified about campaign results, new templates, milestones, and reward opportunities.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto container">
        <div className="mb-12 md:mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
            Features
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Everything you need to grow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From campaign creation to analytics, CaaS gives you the tools to
            promote your business like a pro.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
