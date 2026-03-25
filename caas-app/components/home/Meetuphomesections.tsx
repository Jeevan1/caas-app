import { HeroSection } from "./Herosection";
import { CategoriesSection } from "./CategoriesSection";
import { JoinCTASection } from "./JoinCTASection";
import { NearbyEventsSection } from "./NearbyEventsSection";
import { OnlineEventsSection } from "./OnlineEventsSection";
import { CommunityStoriesSection } from "./CommunityStoriesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function MeetupHomeSections() {
  const user = await getCurrentUser();
  return (
    <>
      <HeroSection user={user} />
      <NearbyEventsSection />
      <OnlineEventsSection />
      <JoinCTASection user={user} />
      <CategoriesSection />
      {/* <PopularCitiesSection /> */}
      <HowItWorksSection />
      <CommunityStoriesSection user={user} />
    </>
  );
}
