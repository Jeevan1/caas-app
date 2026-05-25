import { MeetupHomeSections } from "@/components/home/Meetuphomesections";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Discover & Join Events Near You",
  description:
    "Find and join local meetups, concerts, workshops, and conferences in Nepal. Join Your Event — your go-to event discovery platform.",
  path: "",
});

export default function Page() {
  return (
    <section>
      <MeetupHomeSections />
    </section>
  );
}
