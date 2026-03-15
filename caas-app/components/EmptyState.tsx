import { CalendarX } from "lucide-react";

export function EmptyState({ search }: { search: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarX className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-heading text-base font-semibold text-foreground">
          {search ? `No results for "${search}"` : "No events found"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {search
            ? "Try a different search term or clear the filter."
            : "Check back soon — new events are added regularly."}
        </p>
      </div>
    </div>
  );
}
