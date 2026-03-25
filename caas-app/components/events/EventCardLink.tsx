"use client";
import { trackEventClick } from "@/actions/event-click";
import { Link } from "@/i18n/navigation";

export function EventCardLink({
  idx,
  index,
  className,
  children,
}: {
  idx: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = async () => {
    await trackEventClick(idx);
  };
  return (
    <Link
      href={`/events/${idx}`}
      onClick={handleClick}
      className={className}
      style={{ animationDelay: `${((index ?? 0) % 10) * 40}ms` }}
    >
      {children}
    </Link>
  );
}
