import { MeetupHomeSections } from "@/components/home/Meetuphomesections";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Promote, Grow, and Track Your Business Easily. Affordable DIY marketing tools for small businesses, event organizers, and entrepreneurs.",
  alternates: {
    canonical: "https://joinyourevent.com",
  },
};

export default function Page() {
  return (
    <section>
      <MeetupHomeSections />
    </section>
  );
}
