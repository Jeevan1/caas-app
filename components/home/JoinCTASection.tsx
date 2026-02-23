import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const stats = [
  { value: "50K+", label: "Members" },
  { value: "12K+", label: "Active Now" },
  { value: "200+", label: "Cities" },
];

export function JoinCTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-32">
      {/* ── Animated background orbs ─────────────────────────────────────── */}
      <div
        aria-hidden
        className="cta-orb cta-orb-1 pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="cta-orb cta-orb-2 pointer-events-none absolute -bottom-40 -left-32 h-[600px] w-[600px] rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="cta-orb cta-orb-3 pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.04]"
      />

      {/* ── Grid texture overlay ──────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        {/* Eyebrow badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm"
          style={{ animation: "ctaFadeUp 0.6s ease both" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground/70" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Get started — it's free
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl text-balance"
          style={{ animation: "ctaFadeUp 0.6s ease 0.1s both" }}
        >
          Join CaaS
        </h2>

        {/* Body */}
        <p
          className="mx-auto mt-5 max-w-lg text-lg text-primary-foreground/75 text-balance"
          style={{ animation: "ctaFadeUp 0.6s ease 0.2s both" }}
        >
          People use CaaS to promote their businesses, reach new audiences, find
          support, and pursue their passions — together. Membership is free.
        </p>

        {/* CTA button */}
        <div
          className="mt-8"
          style={{ animation: "ctaFadeUp 0.6s ease 0.3s both" }}
        >
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="cta-btn gap-2 rounded-full px-8 text-base shadow-xl"
            >
              Sign up for free
              <ArrowRight className="h-4 w-4 cta-arrow" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Entrance */
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Floating orbs */
        @keyframes ctaOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-20px, 20px) scale(1.05); }
        }
        @keyframes ctaOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, -16px) scale(1.08); }
        }
        @keyframes ctaOrb3 {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50%       { transform: translateX(-50%) scale(1.12); }
        }

        .cta-orb-1 { animation: ctaOrb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation: ctaOrb2 10s ease-in-out infinite; }
        .cta-orb-3 { animation: ctaOrb3 6s ease-in-out infinite; }

        /* CTA button arrow */
        .cta-btn .cta-arrow {
          transition: transform 0.2s ease;
        }
        .cta-btn:hover .cta-arrow {
          transform: translateX(4px);
        }

        /* Button lift on hover */
        .cta-btn {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px -8px rgba(0,0,0,0.25);
        }
      `}</style>
    </section>
  );
}
