import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { FaqSection, VENDOR_FAQ } from "@/features/marketing/faq";
import { Hero } from "@/features/marketing/hero";
import { fetchHubs } from "@/features/marketing/live-countries";
import { AudienceSection, FeatureSection } from "@/features/marketing/offer-sections";
import { ClosingBand, HowItWorks, HubsBand, PartnerBand, TrustBand, TrustStrip } from "@/features/marketing/sections";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";
import { faqPage, fulfilmentService, organization, website } from "@/lib/structured-data";

export const metadata = { ...publicPage({ title: BRAND.tagline, description: BRAND.description, path: "/" }), title: { absolute: `${BRAND.name} · ${BRAND.tagline}` } };

export default async function HomePage() {
  const hubs = await fetchHubs();
  return (
    <div className="ink-black">
      <MarketingHeader />
      <JsonLd
        data={[
          organization(),
          website(),
          fulfilmentService(
            `${BRAND.name} fulfilment`,
            BRAND.description,
            hubs.map((hub) => hub.countryName),
            "/",
          ),
          faqPage(VENDOR_FAQ),
        ]}
      />
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
    </div>
  );
}
