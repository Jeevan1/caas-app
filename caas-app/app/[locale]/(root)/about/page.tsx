import { HeroSection } from "@/components/about/hero-section";
import { StepsSection } from "@/components/about/steps-section";
import { FeaturesSection } from "@/components/about/features-section";
import { TestimonialsSection } from "@/components/about/testimonials-section";
import { CTASection } from "@/components/about/cta-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Learn more about Join Your Event, our mission, and how we help event organizers promote, grow, and track their events across Nepal.",
  path: "/about",
});

export default function Page() {
  return (
    <section>
      <HeroSection />
      <StepsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </section>
  );
}
