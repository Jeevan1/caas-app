import { HeroSection } from "./Herosection";
import { CategoriesSection } from "./CategoriesSection";
import { JoinCTASection } from "./JoinCTASection";
import { PopularCitiesSection } from "./PopularCitiesSection";
import { NearbyEventsSection } from "./NearbyEventsSection";
import { OnlineEventsSection } from "./OnlineEventsSection";
import { CommunityStoriesSection } from "./CommunityStoriesSection";
import { HowItWorksSection } from "./HowItWorksSection";

export async function MeetupHomeSections() {
  return (
    <>
      <HeroSection />
      <NearbyEventsSection />
      <OnlineEventsSection />
      <JoinCTASection />
      <CategoriesSection />
      <PopularCitiesSection />
      <HowItWorksSection />
      <CommunityStoriesSection />
    </>
  );
}
