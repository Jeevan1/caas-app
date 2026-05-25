import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-8xl font-bold text-primary/20">404</span>
      <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Check the URL or browse events to find what you need.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
        <Link
          href="/events"
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}
