"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/50 transition-all duration-150",
        "hover:bg-muted hover:border-border/80",
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 text-amber-500 transition-all duration-300",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 text-blue-400 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
