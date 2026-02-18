import { UserPlus, Rocket, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up & Create Your Profile",
    description:
      "Create your free account in seconds. Add your business details, logo, and connect your social media accounts.",
  },
  {
    icon: Rocket,
    step: "02",
    title: "Launch Campaigns Using Templates",
    description:
      "Choose from dozens of professionally designed templates for social media, email, flyers, and more. Customize and launch.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Track Analytics & Grow Your Reach",
    description:
      "Monitor views, clicks, and leads in real-time. Optimize your campaigns and watch your business grow.",
  },
]

export function StepsSection() {
  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Get started in three simple steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our platform makes it easy to promote your business without any
            marketing expertise.
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
  )
}
