import { Link } from "@/i18n/navigation";
import { ArrowRight, MapPin } from "lucide-react";
const cities = [
  {
    name: "New York",
    emoji: "🗽",
    events: "2.4K events",
    gradient: "from-blue-950/80 via-blue-900/50",
  },
  {
    name: "San Francisco",
    emoji: "🌉",
    events: "1.8K events",
    gradient: "from-orange-950/80 via-orange-900/50",
  },
  {
    name: "Nepal",
    emoji: "🏔️",
    events: "1.2K events",
    gradient: "from-red-950/80 via-red-800/50",
  },
  {
    name: "Nashville",
    emoji: "🎸",
    events: "890 events",
    gradient: "from-amber-950/80 via-amber-900/50",
  },
  {
    name: "Miami",
    emoji: "🌴",
    events: "1.1K events",
    gradient: "from-cyan-950/80 via-cyan-900/50",
  },
];

export function PopularCitiesSection() {
  return (
    <section className="bg-card py-24 overflow-hidden">
      <div className="mx-auto container">
        {/* Header */}
        <div
          className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
          style={{ animation: "cityFadeUp 0.6s ease both" }}
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Discover
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Popular cities on CaaS
            </h2>
            <p className="mt-2 text-muted-foreground">
              See what organizers are planning in cities around the world.
            </p>
          </div>
          <Link
            href="/cities"
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:mt-0 shrink-0"
          >
            View all cities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* City cards grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {cities.map((city, i) => (
            <Link
              key={city.name}
              href="#"
              className="city-card group relative flex h-52 flex-col justify-end overflow-hidden rounded-3xl border border-border"
              style={{
                animation: `cityFadeUp 0.55s ease both`,
                animationDelay: `${0.08 * i + 0.15}s`,
              }}
            >
              {/* Muted bg base */}
              <div className="absolute inset-0 bg-muted" />

              {/* Emoji — scales and drifts on hover */}
              <div className="city-emoji absolute inset-0 flex items-center justify-center text-8xl select-none transition-all duration-500 ease-out">
                {city.emoji}
              </div>

              {/* Color gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${city.gradient} to-transparent opacity-60 transition-opacity duration-400 group-hover:opacity-80`}
              />

              {/* Shine sweep on hover */}
              <div className="city-shine absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700" />

              {/* Content */}
              <div className="relative flex flex-col gap-1 p-4">
                <div className="flex items-center gap-1.5 opacity-0 transition-all duration-300 city-meta">
                  <MapPin className="h-3 w-3 text-white/70" />
                  <span className="text-[11px] font-medium text-white/70">
                    {city.events}
                  </span>
                </div>
                <p className="font-heading text-lg font-bold text-white drop-shadow-md">
                  {city.name}
                </p>
              </div>

              {/* Bottom border accent */}
              <div className="city-accent absolute bottom-0 left-0 h-[3px] w-0 bg-white/60 transition-all duration-300 rounded-b-3xl" />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Entrance ─────────────────────────────── */
        @keyframes cityFadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Card lift ────────────────────────────── */
        .city-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .city-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.25);
          border-color: hsl(var(--border) / 0.6);
        }

        /* ── Emoji drift + grow ───────────────────── */
        .city-emoji {
          opacity: 0.38;
        }
        .city-card:hover .city-emoji {
          opacity: 0.75;
          transform: scale(1.2) translateY(-6px);
        }

        /* ── Shine sweep ──────────────────────────── */
        .city-card:hover .city-shine {
          transform: translateX(200%) skew(-20deg);
        }

        /* ── Event count slides up ────────────────── */
        .city-meta {
          transform: translateY(6px);
        }
        .city-card:hover .city-meta {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Bottom accent line expands ───────────── */
        .city-card:hover .city-accent {
          width: 100%;
        }
      `}</style>
    </section>
  );
}
