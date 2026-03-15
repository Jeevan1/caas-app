import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { Section } from "../section";

export async function CTASection({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const user = await getCurrentUser();

  if (user?.primary_role !== "organizer") {
    return (
      <section className="bg-primary py-20 md:py-24 relative overflow-hidden">
        <div className="cta-orb-1 absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="cta-orb-2 absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <Section className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl text-balance">
              Ready to find your next event?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Whether you're an organization looking to grow your community or
              someone searching for the next great experience —
              JoinYourEvent.com is where it all happens. Post events, build
              audiences, and connect with people who share your passion.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Join for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Browse events
                </Button>
              </Link>
            </div>
          </div>
        </Section>
        <style>{`
        .cat-card  { transition:transform .25s cubic-bezier(.34,1.4,.64,1),box-shadow .25s ease; }
        .cat-card:hover { transform:translateY(-6px); }
        .group-card{ transition:transform .22s cubic-bezier(.34,1.4,.64,1),box-shadow .22s ease; }
        .group-card:hover { transform:translateY(-4px); }
        .event-row { transition:transform .18s ease,box-shadow .18s ease; }
        .event-row:hover { transform:translateX(4px); }
        .step-card { transition:transform .22s cubic-bezier(.34,1.4,.64,1),box-shadow .22s ease; }
        .step-card:hover { transform:translateY(-4px); }
        .story-card{ transition:transform .28s cubic-bezier(.34,1.3,.64,1),box-shadow .28s ease; }
        .story-card:hover { transform:translateY(-6px) scale(1.01); }
        .cta-btn   { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
        .cta-btn:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 20px 40px -8px rgba(0,0,0,.25); }
        .cta-orb-1 { animation:orb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation:orb2 11s ease-in-out infinite; }
        @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(-16px,20px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-16px)}}
      `}</style>
      </section>
    );
  }

  return null;
}
