import { Mail, MessageSquare, HelpCircle, Phone } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { Section } from "@/components/section";
import ContactForm from "@/components/contact/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get in touch with the Join Your Event team. We're here to help you with any questions or support you need.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team typically responds within 24 hours.",
    detail: "contact@joinyourevent.com",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Monday through Friday, 9am to 5pm.",
    detail: "Start a conversation",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak directly with our support team.",
    detail: "+977 9810322739",
  },
];

const faqs = [
  {
    q: "How do I create my first campaign?",
    a: "After signing up, head to your Dashboard and click 'New Campaign'. Choose a template, customize it, set your goals, and launch.",
  },
  {
    q: "Can I use Join Your Event for free?",
    a: "Yes! You can start for free with access to essential event management features. Upgrade anytime as your needs grow. No credit card required.",
  },
  {
    q: "How do referral links work?",
    a: "When you create a referral campaign, Join Your Event auto-generates unique referral links that track clicks and conversions automatically.",
  },
  {
    q: "What analytics does Join Your Event track?",
    a: "We track views, clicks, click-through rates, leads generated, and campaign performance over time with detailed charts.",
  },
];

export default function ContactPage() {
  return (
    <section>
      <PageBanner
        heading={"Contact & Support"}
        title={"We're here to help"}
        description={
          "Have a question, need help, or want to share feedback? Reach out and our team will get back to you quickly."
        }
      />

      {/* Contact Methods */}
      <section className="bg-card py-12">
        <div className="mx-auto container">
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, i) => (
              <Section
                key={method.title}
                delay={i * 0.1}
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
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + FAQs */}
      <div className="bg-card pb-24 pt-12">
        <div className="mx-auto container">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* Contact Form */}
            <ContactForm />

            {/* FAQs */}
            <Section>
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
                {faqs.map((faq, i) => (
                  <Section
                    key={faq.q}
                    delay={i * 0.1}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      {faq.q}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </Section>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </section>
  );
}
