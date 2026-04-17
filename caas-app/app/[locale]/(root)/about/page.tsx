import { HeroSection } from "@/components/about/hero-section";
import { StepsSection } from "@/components/about/steps-section";
import { FeaturesSection } from "@/components/about/features-section";
import { TestimonialsSection } from "@/components/about/testimonials-section";
import { CTASection } from "@/components/about/cta-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Join Your Event, our mission, and how we help you promote, grow, and track your events.",
};

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
