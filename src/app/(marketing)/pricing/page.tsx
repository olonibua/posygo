import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { FeeSummary } from "@/features/finance/fee-summary";
import { FaqSection, type FaqItem } from "@/features/marketing/faq";
import { loadMarkets } from "@/features/marketing/market-data";
import { scheduleOffers } from "@/features/marketing/market-offers";
import { countryPath } from "@/features/marketing/markets";
import { PageIntro, PageSection } from "@/features/marketing/page-intro";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";
import { breadcrumbs, faqPage, fulfilmentService, priceOffers } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "Fulfilment pricing: pay per box and per order",
  description: "Posygo fulfilment prices for every country we serve: a one-off stocking fee, monthly storage per box, a fee per packed order and carrier shipping. No subscription.",
  path: "/pricing",
});

const PRICING_FAQ: readonly FaqItem[] = [
  {
    question: "Is there a monthly subscription?",
    answer: "No. You pay for what you use: stocking and storage per box, a fee for each order packed, and shipping at the carrier's price plus a small markup.",
  },
  {
    question: "How is storage charged?",
    answer: "Per box, by size, each month. When a box arrives you pay a one-off stocking fee plus its first month. Very large boxes and pallets are priced by quote.",
  },
  { question: "How do I pay?", answer: "Top up your wallet in your local currency. Fees are taken from it as work is done, and every charge is listed with what it was for." },
];

export default async function PricingPage() {
  const markets = (await loadMarkets()).filter((market) => market.prices !== null);
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          ...markets.map((market) => ({
            ...fulfilmentService(`${BRAND.name} fulfilment in ${market.country.name}`, `Fulfilment prices in ${market.country.name}.`, [market.country.name], countryPath(market.country)),
            hasOfferCatalog: priceOffers(market.country.currency, scheduleOffers(market.prices!.schedule)),
          })),
          faqPage(PRICING_FAQ),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 sm:px-8">
        <PageIntro stamp="Pricing" title="Simple prices, per box and per order">
          <p>No subscription and no minimum. These are the prices in force today in each country we serve.</p>
          <div className="mt-8">
            <ButtonLink href="/signup">Get started →</ButtonLink>
          </div>
        </PageIntro>
        {markets.length === 0 ? <p className="mt-10 text-ink-soft">Prices appear here when our first hubs open.</p> : null}
        {markets.map((market) => (
          <PageSection key={market.country.code} title={market.country.name}>
            <div className="max-w-[640px]">
              <FeeSummary schedule={market.prices!.schedule} currency={market.country.currency} locale={market.country.locale} title={`Prices in ${market.country.currency}`} />
              <p className="mt-3 text-small">
                <Link href={countryPath(market.country)}>More about fulfilment in {market.country.name}</Link>
              </p>
            </div>
          </PageSection>
        ))}
        <FaqSection items={PRICING_FAQ} heading="Questions about pricing" />
        <div className="pb-24" />
      </main>
      <MarketingFooter />
    </>
  );
}
