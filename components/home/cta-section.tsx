import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl text-balance">
          Ready to grow your business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Join thousands of entrepreneurs who use CaaS to promote their
          businesses, track results, and reach new audiences.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
