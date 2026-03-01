"use client";

import { useState, useEffect } from "react";
import { cn, useApiMutation } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { Heart } from "lucide-react";
import { useCurrentUser } from "@/lib/providers";
import { Event, PaginatedAPIResponse, User } from "@/lib/types";
import { FAVORITE_QUERY_KEY } from "@/constants";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type FavoriteStatus = { id: string; user: User; event: Event };

const BURST_ANGLES = [
  { x: -14, y: -14 },
  { x: 14, y: -14 },
  { x: 18, y: 0 },
  { x: 14, y: 14 },
  { x: -14, y: 14 },
  { x: -18, y: 0 },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const EventFavorite = ({
  eventId,
  showCount = false,
}: {
  eventId: string;
  showCount?: boolean;
}) => {
  const user = useCurrentUser();

  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<FavoriteStatus>>(
    {
      url: `/api/event/favorites`,
      queryKey: FAVORITE_QUERY_KEY(eventId),
    },
  );

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [pop, setPop] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!isLoading && data) {
      setLiked(data.results.some((f) => f.user.id === user?.id));
      setCount(data.count ?? 0);
    }
  }, [data, isLoading, user?.id]);

  const { mutateAsync: like, isPending: liking } = useApiMutation({
    apiPath: "/api/event/favorites/",
    method: "POST",
    queryKey: FAVORITE_QUERY_KEY(eventId),
    successMessage: "Added to favorites!",
  });

  const { mutateAsync: unlike, isPending: unliking } = useApiMutation({
    apiPath: `/api/event/favorites/unfavorite/`,
    method: "POST",
    queryKey: FAVORITE_QUERY_KEY(eventId),
    successMessage: "Removed from favorites!",
  });

  const isPending = liking || unliking;

  const triggerAnimations = () => {
    setPop(true);
    setBurst(true);
    setTimeout(() => setPop(false), 400);
    setTimeout(() => setBurst(false), 600);
  };

  const handleToggle = async () => {
    if (isPending) return;

    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    if (next) triggerAnimations();

    try {
      await (next ? like({ event: eventId }) : unlike({ event: eventId }));
    } catch {
      setLiked(!next);
      setCount((c) => (!next ? c + 1 : Math.max(0, c - 1)));
    }
  };

  return (
    <div className="relative flex items-center gap-1.5">
      {burst && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {BURST_ANGLES.map(({ x, y }, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-red-400"
              style={{ animation: `burst-${i} 0.6s ease-out forwards` }}
            />
          ))}
        </span>
      )}

      <button
        type="button"
        disabled={isPending || isLoading}
        onClick={handleToggle}
        aria-label={liked ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50",
          liked
            ? "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:hover:bg-red-950/60"
            : "border-border bg-card hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-900 dark:hover:bg-red-950/20",
          isPending && "opacity-70",
        )}
      >
        {liked && (
          <span className="absolute inset-0 rounded-full bg-red-400/10 transition-all duration-300 group-hover:bg-red-400/20" />
        )}

        <Heart
          className={cn(
            "relative transition-all duration-300",
            pop ? "scale-125" : "scale-100",
            liked
              ? "h-4 w-4 fill-red-500 text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
              : "h-4 w-4 text-muted-foreground group-hover:text-red-400",
          )}
        />
      </button>

      {showCount && count > 0 && (
        <span
          className={cn(
            "min-w-[1.25rem] text-center text-xs font-semibold tabular-nums transition-colors duration-200",
            liked ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}

      <style>{`
        ${BURST_ANGLES.map(
          ({ x, y }, i) =>
            `@keyframes burst-${i} { to { transform: translate(${x}px, ${y}px) scale(0); opacity: 0; } }`,
        ).join("\n        ")}
      `}</style>
    </div>
  );
};

export default EventFavorite;
