"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-8xl font-bold text-destructive/20">500</span>
      <h1 className="text-3xl font-bold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or contact support if the
        issue persists.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <a
          href="/contact"
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
