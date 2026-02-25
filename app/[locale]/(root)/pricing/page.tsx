import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing - CaaS",
  description:
    "Choose the perfect plan for your business. Start free or upgrade for unlimited campaigns and premium features.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with basic marketing campaigns.",
    cta: "Get Started Free",
    highlighted: false,
    features: [
      { text: "3 active campaigns", included: true },
      { text: "Basic analytics", included: true },
      { text: "5 free templates", included: true },
      { text: "Community support", included: true },
      { text: "Gamification & badges", included: true },
      { text: "Premium templates", included: false },
      { text: "Advanced analytics", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description:
      "Unlimited campaigns and advanced features for growing businesses.",
    cta: "Start Pro Trial",
    highlighted: true,
    features: [
      { text: "Unlimited campaigns", included: true },
      { text: "Advanced analytics", included: true },
      { text: "All premium templates", included: true },
      { text: "Priority email support", included: true },
      { text: "Gamification & leaderboard", included: true },
      { text: "Custom branding", included: true },
      { text: "Schedule campaigns", included: true },
      { text: "API access", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description:
      "Full platform access with API, dedicated support, and custom integrations.",
    cta: "Contact Sales",
    highlighted: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "API access", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label options", included: true },
      { text: "Team collaboration", included: true },
      { text: "SSO / SAML", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Custom analytics reports", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes! All Pro plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Absolutely. You can cancel anytime from your dashboard. Your access continues until the end of your billing period.",
  },
];

export default function PricingPage() {
  return (
    <section>
      {/* Hero */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto container text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="bg-card py-16">
        <div className="mx-auto container">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-background shadow-lg"
                    : "border-border bg-background"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <Link href="/dashboard" className="mt-6">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                <div className="mt-8 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <div
                      key={f.text}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      {f.included ? (
                        <Check className="h-4 w-4 flex-shrink-0 text-secondary" />
                      ) : (
                        <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          f.included
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                        }
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-background py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
