"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CTASection } from "@/components/home/cta-section"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Share2,
  Mail,
  FileImage,
  Link2,
  Eye,
  Download,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All Templates" },
  { id: "social", label: "Social Media" },
  { id: "email", label: "Email" },
  { id: "flyer", label: "Flyers & Posters" },
  { id: "referral", label: "Referral" },
]

const templates = [
  {
    id: 1,
    name: "Product Launch Post",
    category: "social",
    icon: Share2,
    description: "Announce your new product with a vibrant social media post. Customizable text, images, and call-to-action.",
    tags: ["Instagram", "Facebook", "Twitter"],
    premium: false,
  },
  {
    id: 2,
    name: "Event Invitation",
    category: "email",
    icon: Mail,
    description: "Beautiful email invitation template for workshops, webinars, and meetups. Drag-and-drop editor included.",
    tags: ["Email", "Responsive"],
    premium: false,
  },
  {
    id: 3,
    name: "Sale Flyer",
    category: "flyer",
    icon: FileImage,
    description: "Eye-catching sale flyer template. Download as PDF or high-resolution image for print or digital use.",
    tags: ["PDF", "Print-Ready"],
    premium: false,
  },
  {
    id: 4,
    name: "Referral Card",
    category: "referral",
    icon: Link2,
    description: "Share-friendly referral card with auto-generated referral links and tracking built in.",
    tags: ["Tracking", "Auto-Link"],
    premium: false,
  },
  {
    id: 5,
    name: "Story Highlight",
    category: "social",
    icon: Share2,
    description: "Instagram Story template designed to highlight your brand's best moments and offerings.",
    tags: ["Instagram", "Stories"],
    premium: true,
  },
  {
    id: 6,
    name: "Newsletter Template",
    category: "email",
    icon: Mail,
    description: "Professional newsletter template with sections for updates, featured content, and CTAs.",
    tags: ["Email", "Multi-Section"],
    premium: true,
  },
  {
    id: 7,
    name: "Event Poster",
    category: "flyer",
    icon: FileImage,
    description: "Large-format event poster template. Perfect for conferences, festivals, and community events.",
    tags: ["Print", "A3/A2"],
    premium: true,
  },
  {
    id: 8,
    name: "Loyalty Program",
    category: "referral",
    icon: Link2,
    description: "Build customer loyalty with a points-based rewards card. Integrate with your campaigns.",
    tags: ["Rewards", "Loyalty"],
    premium: true,
  },
  {
    id: 9,
    name: "Carousel Post",
    category: "social",
    icon: Share2,
    description: "Multi-slide carousel template for educational or product showcase content on Instagram and LinkedIn.",
    tags: ["LinkedIn", "Instagram"],
    premium: false,
  },
  {
    id: 10,
    name: "Welcome Email",
    category: "email",
    icon: Mail,
    description: "Onboarding email template to welcome new subscribers with a warm, professional introduction.",
    tags: ["Email", "Onboarding"],
    premium: false,
  },
  {
    id: 11,
    name: "Business Card",
    category: "flyer",
    icon: FileImage,
    description: "Modern business card template with QR code integration. Print-ready format.",
    tags: ["Print", "QR Code"],
    premium: false,
  },
  {
    id: 12,
    name: "Affiliate Link Page",
    category: "referral",
    icon: Link2,
    description: "Custom landing page for affiliate and referral links with built-in analytics tracking.",
    tags: ["Landing Page", "Analytics"],
    premium: true,
  },
]

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Template Library
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Professional marketing templates
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Choose from dozens of beautifully designed templates for social
              media, email, flyers, and referral campaigns. Customize and launch
              in minutes.
            </p>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="bg-card py-16">
          <div className="mx-auto max-w-7xl px-6">
            {/* Category Filter */}
            <div className="mb-10 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((template) => (
                <div
                  key={template.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  {template.premium && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                      <Sparkles className="h-3 w-3" />
                      Pro
                    </div>
                  )}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <template.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {template.name}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1 gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
