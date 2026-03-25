"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { becomeOrganizerAction } from "@/actions/become-organizer";

const PERKS = [
  "Create and manage events",
  "Access organizer dashboard",
  "Sell tickets & manage attendees",
  "Analytics and reporting tools",
];

export function BecomeOrganizerCard() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleJoin = async () => {
    setIsPending(true);
    try {
      const result = await becomeOrganizerAction();

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setDone(true);
      toast({
        title: "You're now an organizer!",
        description: "Your account has been upgraded successfully.",
        variant: "default",
      });

      setTimeout(() => router.push("/dashboard"), 1500);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-background px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none fixed -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-secondary/8 blur-3xl" />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        style={{ animation: "fadeUp 0.55s cubic-bezier(0.34,1.1,0.64,1) both" }}
      >
        <div className="h-[2.5px] w-full bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="px-7 pb-8 pt-7 flex flex-col gap-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Become an Organizer
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              You're already signed in. Upgrade your account to start creating
              and managing events.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2.5 text-sm text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {perk}
              </li>
            ))}
          </ul>

          {done ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Redirecting to dashboard…
            </div>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  Join as Organizer
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Free to start · No credit card required
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
