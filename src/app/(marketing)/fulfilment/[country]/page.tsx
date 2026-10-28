import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { FeeSummary } from "@/features/finance/fee-summary";
import { FaqSection } from "@/features/marketing/faq";
import { loadLiveCountries, loadMarket } from "@/features/marketing/market-data";
import { marketDescription, marketFaq, marketTitle } from "@/features/marketing/market-copy";
import { scheduleOffers } from "@/features/marketing/market-offers";
import { capitalised, countryPath, countryPhrase, fulfilmentWord } from "@/features/marketing/markets";
import { PageIntro, PageSection } from "@/features/marketing/page-intro";
import { HowItWorks, TrustStrip } from "@/features/marketing/sections";
import { BRAND } from "@/lib/brand";
import { PRIVATE_PAGE, publicPage } from "@/lib/site";
import { breadcrumbs, faqPage, fulfilmentService, priceOffers } from "@/lib/structured-data";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = await loadMarket((await params).country);
  if (!market) {
    return { title: "Market", ...PRIVATE_PAGE };
  }
  return publicPage({ title: marketTitle(market), description: marketDescription(market), path: countryPath(market.country) });
}

export default async function MarketPage({ params }: Props) {
  const market = await loadMarket((await params).country);
  if (!market) {
    notFound();
  }
  const { country, prices } = market;
  const word = fulfilmentWord(country.code);
  const path = countryPath(country);
  const place = countryPhrase(country);
  const faq = marketFaq(market);
  const others = (await loadLiveCountries()).filter((other) => other.code !== country.code);
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          {
            ...fulfilmentService(`${BRAND.name} ${word} in ${place}`, marketDescription(market), [country.name], path),
            ...(prices ? { hasOfferCatalog: priceOffers(country.currency, scheduleOffers(prices.schedule)) } : {}),
          },
          faqPage(faq),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Fulfilment", path: "/fulfilment" },
            { name: country.name, path },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 sm:px-8">
        <PageIntro stamp={country.name} title={`Ecommerce ${word} in ${place}`}>
          <p>
            Get your products closer to your customers in {place}. We count and photograph every box when it arrives, pack and photograph every order before it leaves, and deliver it in days with
            tracking. You pay in {country.currency}, with no monthly subscription.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Start selling in {place} →</ButtonLink>
            <ButtonLink href="/pricing" variant="ghost">
              See all prices
            </ButtonLink>
          </div>
        </PageIntro>
        <TrustStrip />
        {prices ? (
          <PageSection title={`${capitalised(word)} prices in ${place}`}>
            <div className="max-w-[640px]">
              <FeeSummary schedule={prices.schedule} currency={country.currency} locale={country.locale} title={`Prices in ${country.currency}`} />
            </div>
          </PageSection>
        ) : null}
        <HowItWorks />
        <FaqSection items={faq} heading={`${capitalised(word)} in ${place}: questions sellers ask`} />
        {others.length > 0 ? (
          <PageSection title="Other countries we deliver in">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[17px]">
              {others.map((other) => (
                <li key={other.code}>
                  <Link href={countryPath(other)}>
                    {capitalised(fulfilmentWord(other.code))} in {countryPhrase(other)}
                  </Link>
                </li>
              ))}
            </ul>
          </PageSection>
        ) : null}
        <div className="pb-24" />
      </main>
      <MarketingFooter />
    </>
  );
}
