import { CTASection } from "@/components/about/cta-section";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Palette,
  Rocket,
  BarChart3,
  ArrowRight,
  Target,
  TrendingUp,
  Megaphone,
  Mail,
  Share2,
  FileImage,
} from "lucide-react";

export const metadata = {
  title: "How It Works - CaaS",
  description:
    "Learn how CaaS helps you promote, grow, and track your business in three simple steps.",
};

const detailedSteps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up & Create Your Profile",
    description:
      "Getting started takes less than a minute. Create your free account, add your business name, logo, and connect your social media accounts. Your profile becomes your marketing hub.",
    features: [
      "Quick email or OAuth sign-up",
      "Add business details and logo",
      "Connect social media accounts",
      "Set your marketing goals",
    ],
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose & Customize Templates",
    description:
      "Browse our library of professionally designed marketing templates. Customize text, images, colors, and links to match your brand perfectly.",
    features: [
      "Social media post templates",
      "Email campaign templates",
      "Flyer and poster downloads",
      "Custom branding options",
    ],
  },
  {
    icon: Rocket,
    step: "03",
    title: "Launch Your Campaigns",
    description:
      "Set your campaign goals, choose your audience, and launch. Whether it's an event, product launch, or service promotion, we've got you covered.",
    features: [
      "Set click, lead, or registration goals",
      "Schedule campaigns in advance",
      "Multi-channel distribution",
      "Auto-generate referral links",
    ],
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Track & Optimize",
    description:
      "Watch your campaigns perform in real-time. Our analytics dashboard shows you views, clicks, leads, and more. Optimize and grow your reach continuously.",
    features: [
      "Real-time analytics dashboard",
      "Campaign performance charts",
      "Lead tracking and reporting",
      "Earn points and climb leaderboards",
    ],
  },
];

const campaignTypes = [
  {
    icon: Megaphone,
    title: "Event Promotion",
    description:
      "Promote workshops, concerts, meetups, and conferences with targeted campaigns.",
  },
  {
    icon: Target,
    title: "Product Launch",
    description:
      "Build hype and drive sales for new product releases with multi-channel marketing.",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description:
      "Reach your audience directly with beautifully designed email marketing templates.",
  },
  {
    icon: Share2,
    title: "Social Media Blitz",
    description:
      "Create engaging social media content across all platforms simultaneously.",
  },
  {
    icon: FileImage,
    title: "Print Materials",
    description:
      "Design and download professional flyers, posters, and brochures.",
  },
  {
    icon: TrendingUp,
    title: "Referral Programs",
    description:
      "Grow organically with automated referral link campaigns and tracking.",
  },
];

export default function HowItWorksPage() {
  return (
    <section>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background py-14 md:py-20">
        <div className="mx-auto container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                How It Works
              </p>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
                From zero to marketing hero
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground lg:mx-0">
                CaaS makes it easy for anyone to create professional marketing
                campaigns, track performance, and grow their business.
              </p>
            </div>
            <div className="relative mx-auto h-64 w-full max-w-md overflow-hidden rounded-2xl lg:h-80">
              <Image
                src="/images/how-it-works-hero.jpg"
                alt="Business owner launching marketing campaigns from a tablet"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="bg-card py-20 md:py-24">
        <div className="mx-auto container">
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
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
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

                {/* Visual Card */}
                <div
                  className={`rounded-2xl border border-border bg-background p-8 ${index % 2 !== 0 ? "lg:[direction:ltr]" : ""}`}
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

      {/* Campaign Types */}
      <section className="bg-background py-20 md:py-24">
        <div className="mx-auto container">
          <div className="mb-12 md:mb-16 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Campaign Types
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Examples of what you can create
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From events to products, our platform supports every type of
              marketing campaign you need.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaignTypes.map((ct) => (
              <div
                key={ct.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ct.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {ct.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ct.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start Creating Campaigns
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
