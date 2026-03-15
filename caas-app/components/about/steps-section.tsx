import { UserPlus, CalendarPlus, Users } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Free Account",
    description:
      "Sign up in seconds as an individual or organization. Set up your profile, add your details, and you're ready to go — no credit card needed.",
  },
  {
    icon: CalendarPlus,
    step: "02",
    title: "Post or Discover Events",
    description:
      "Organizations can publish events instantly and reach thousands of interested attendees. Individuals can browse, filter, and RSVP to events happening near them.",
  },
  {
    icon: Users,
    step: "03",
    title: "Connect & Grow Your Community",
    description:
      "Meet people who share your interests, build a loyal audience around your events, and turn one-time attendees into a thriving community.",
  },
];

export function StepsSection() {
  return (
    <section className="bg-card py-20 md:py-24">
      <div className="mx-auto container">
        <div className="mb-12 md:mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            From sign-up to community in three steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Whether you're hosting your first event or joining one,
            JoinYourEvent.com makes it effortless to connect with the right
            people.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="absolute right-6 top-6 text-4xl font-bold text-muted/60 font-heading">
                {item.step}
              </span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
