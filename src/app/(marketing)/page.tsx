import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { FaqSection, VENDOR_FAQ } from "@/features/marketing/faq";
import { Hero } from "@/features/marketing/hero";
import { CostComparison } from "@/features/marketing/cost-comparison";
import { GettingStarted } from "@/features/marketing/getting-started";
import { fetchHubs, fetchMarketCosts } from "@/features/marketing/live-countries";
import { FeatureSection } from "@/features/marketing/offer-sections";
import { ClosingBand, HowItWorks, CountriesBand, TrustBand, TrustStrip } from "@/features/marketing/sections";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";
import { faqPage, fulfilmentService, organization, website } from "@/lib/structured-data";

export const metadata = { ...publicPage({ title: BRAND.tagline, description: BRAND.description, path: "/" }), title: { absolute: `${BRAND.name} · ${BRAND.tagline}` } };

export default async function HomePage() {
  const hubs = await fetchHubs();
  const markets = await fetchMarketCosts(hubs);
  return (
    <>
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
        <Hero />
        <div className="mx-auto max-w-container px-4 sm:px-8">
          {markets.length > 0 ? <CostComparison markets={markets} /> : null}
          <TrustStrip />
          <Reveal>
            <HowItWorks />
          </Reveal>
          <Reveal>
            <GettingStarted />
          </Reveal>
          <Reveal>
            <CountriesBand hubs={hubs} />
          </Reveal>
          <Reveal>
            <FeatureSection />
          </Reveal>
          <Reveal>
            <TrustBand />
          </Reveal>
          <Reveal>
            <FaqSection items={VENDOR_FAQ} />
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
