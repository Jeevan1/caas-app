import {
  CalendarCheck,
  Search,
  Building2,
  Bell,
  CreditCard,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Event Publishing",
    description:
      "Create and publish events in minutes. Set dates, locations, capacity, ticket prices, and go live instantly to thousands of potential attendees.",
  },
  {
    icon: Search,
    title: "Event Discovery",
    description:
      "Powerful search and filtering lets attendees find events by category, location, date, or interest — so the right people always find your event.",
  },
  {
    icon: Building2,
    title: "Organization Profiles",
    description:
      "Organizations get a dedicated profile page to showcase their brand, history of events, and upcoming schedule — building trust with their audience.",
  },
  {
    icon: Users,
    title: "Community Management",
    description:
      "Manage RSVPs, track attendance, communicate with registrants, and turn every event into a growing, engaged community.",
  },
  {
    icon: CreditCard,
    title: "Paid & Free Events",
    description:
      "Host free community events or sell tickets with built-in payment support. Flexible pricing options work for organizers of every size.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Attendees get reminders before events. Organizers get notified about new RSVPs, questions, and community activity — all in real time.",
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
            Everything you need to host and join events
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            JoinYourEvent.com gives organizers the tools to reach their audience
            and gives attendees the easiest way to find what's happening around
            them.
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
