import { HeroSection } from "@/components/about/hero-section";
import { StepsSection } from "@/components/about/steps-section";
import { FeaturesSection } from "@/components/about/features-section";
import { TestimonialsSection } from "@/components/about/testimonials-section";
import { CTASection } from "@/components/about/cta-section";

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
