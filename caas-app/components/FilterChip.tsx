import { Category, FilterState } from "@/lib/types";
import { X } from "lucide-react";

export function FilterChips({
  applied,
  categories,
  onRemove,
}: {
  applied: FilterState;
  categories: Category[];
  onRemove: (key: keyof FilterState) => void;
}) {
  const chips: { key: keyof FilterState; label: string }[] = [];

  if (applied.category) {
    const name =
      categories.find((c) => c.idx === applied.category)?.name ??
      applied.category;
    chips.push({ key: "category", label: `Category: ${name}` });
  }
  if (applied.is_paid === true)
    chips.push({ key: "is_paid", label: "Paid only" });
  if (applied.is_paid === false)
    chips.push({ key: "is_paid", label: "Free only" });
  if (applied.start_date)
    chips.push({ key: "start_date", label: `From: ${applied.start_date}` });
  if (applied.end_date)
    chips.push({ key: "end_date", label: `To: ${applied.end_date}` });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ml-0.5 rounded-full hover:text-primary/70"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
