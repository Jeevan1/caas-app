"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, HelpCircle, Send, Phone } from "lucide-react";
import { useState } from "react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team typically responds within 24 hours.",
    detail: "support@caas.app",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Monday through Friday, 9am to 5pm EST.",
    detail: "Start a conversation",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak directly with our support team.",
    detail: "+1 (555) 123-4567",
  },
];

const faqs = [
  {
    q: "How do I create my first campaign?",
    a: "After signing up, head to your Dashboard and click 'New Campaign'. Choose a template, customize it, set your goals, and launch.",
  },
  {
    q: "Can I use CaaS for free?",
    a: "Yes! Our Free plan includes 3 active campaigns, basic analytics, and access to 5 templates. No credit card required.",
  },
  {
    q: "How do referral links work?",
    a: "When you create a referral campaign, CaaS auto-generates unique referral links that track clicks and conversions automatically.",
  },
  {
    q: "What analytics does CaaS track?",
    a: "We track views, clicks, click-through rates, leads generated, and campaign performance over time with detailed charts.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely. You can upgrade or downgrade anytime from your dashboard. Changes take effect on your next billing cycle.",
  },
  {
    q: "Do you offer team or enterprise plans?",
    a: "Yes! Our Enterprise plan includes team collaboration, API access, SSO, and a dedicated account manager. Contact us for details.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section>
      {/* Hero */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto container text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Contact & Support
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            {"We're here to help"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have a question, need help, or want to share feedback? Reach out and
            our team will get back to you quickly.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="bg-card py-12">
        <div className="mx-auto container">
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="flex flex-col items-center rounded-2xl border border-border bg-background p-8 text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <method.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {method.title}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {method.description}
                </p>
                <p className="text-sm font-medium text-primary">
                  {method.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + FAQs */}
      <section className="bg-card pb-24 pt-12">
        <div className="mx-auto container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Send us a message
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form and we will respond within 24 hours.
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12l5 5L19 7"
                        stroke="hsl(152, 60%, 42%)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Message sent!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for reaching out. We will get back to you soon.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your question or feedback..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* FAQs */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Quick answers to common questions.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      {faq.q}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
