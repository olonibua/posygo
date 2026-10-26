import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { Reveal } from "@/components/ui/reveal";
import { FaqSection, VENDOR_FAQ } from "@/features/marketing/faq";
import { Hero } from "@/features/marketing/hero";
import { fetchHubs } from "@/features/marketing/live-countries";
import { AudienceSection, FeatureSection } from "@/features/marketing/offer-sections";
import { ClosingBand, HowItWorks, HubsBand, PartnerBand, TrustBand, TrustStrip } from "@/features/marketing/sections";

export default async function HomePage() {
  const hubs = await fetchHubs();
  return (
    <>
      <MarketingHeader />
      <main id="main">
        <Hero hubCountries={hubs.map((hub) => hub.countryName)} />
        <div className="mx-auto max-w-container px-4 sm:px-8">
          <TrustStrip />
          <Reveal>
            <HowItWorks />
          </Reveal>
          <Reveal>
            <HubsBand hubs={hubs} />
          </Reveal>
          <Reveal>
            <FeatureSection />
          </Reveal>
          <Reveal>
            <TrustBand />
          </Reveal>
          <Reveal>
            <AudienceSection />
          </Reveal>
          <Reveal>
            <FaqSection items={VENDOR_FAQ} />
          </Reveal>
          <Reveal>
            <PartnerBand />
          </Reveal>
        </div>
        <Reveal>
          <ClosingBand />
        </Reveal>
      </main>
      <MarketingFooter />
    </>
  );
}
