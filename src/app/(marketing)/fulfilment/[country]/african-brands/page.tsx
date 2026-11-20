import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { NotebookNote, Paper, Stamp, StepNumber } from "@/components/ui/surfaces";
import { FeeSummary } from "@/features/finance/fee-summary";
import {
  AFRICAN_SELLER_COUNTRIES,
  africanBrandsComparison,
  africanBrandsDescription,
  africanBrandsFaq,
  africanBrandsPath,
  africanBrandsSteps,
  africanBrandsTitle,
} from "@/features/marketing/african-brands-copy";
import { FaqSection } from "@/features/marketing/faq";
import { loadMarket } from "@/features/marketing/market-data";
import { capitalised, countryPath, countryPhrase, fulfilmentWord } from "@/features/marketing/markets";
import { PageIntro, PageSection } from "@/features/marketing/page-intro";
import { TrustStrip } from "@/features/marketing/sections";
import { storePlatformPath } from "@/features/marketing/store-platforms";
import { BRAND } from "@/lib/brand";
import { PRIVATE_PAGE, publicPage } from "@/lib/site";
import { breadcrumbs, faqPage, fulfilmentService } from "@/lib/structured-data";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = await loadMarket((await params).country);
  if (!market) {
    return { title: "Market", ...PRIVATE_PAGE };
  }
  return publicPage({ title: africanBrandsTitle(market.country), description: africanBrandsDescription(market.country), path: africanBrandsPath(market.country) });
}

export default async function AfricanBrandsPage({ params }: Props) {
  const market = await loadMarket((await params).country);
  if (!market) {
    notFound();
  }
  const { country, prices } = market;
  const place = countryPhrase(country);
  const word = fulfilmentWord(country.code);
  const path = africanBrandsPath(country);
  const faq = africanBrandsFaq(market);
  const comparison = africanBrandsComparison(country);
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          fulfilmentService(africanBrandsTitle(country), africanBrandsDescription(country), [country.name], path),
          faqPage(faq),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Fulfilment", path: "/fulfilment" },
            { name: country.name, path: countryPath(country) },
            { name: "African brands", path },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 pb-24 sm:px-8">
        <PageIntro stamp={`Selling from Africa to ${country.name}`} title={africanBrandsTitle(country)}>
          <p>
            Your brand is in {AFRICAN_SELLER_COUNTRIES} or anywhere in Africa, and your customers are in {place}. Send your stock in bulk, we store it in {place}, and each order is packed and
            delivered locally in days, with tracking. No more shipping every order across the world.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Start selling in {place} →</ButtonLink>
            <ButtonLink href="/pricing" variant="ghost">
              See all prices
            </ButtonLink>
          </div>
        </PageIntro>
        <TrustStrip />
        <PageSection title={`How ${word} in ${place} works for African brands`}>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {africanBrandsSteps(country).map((step, index) => (
              <li key={step.title}>
                <Paper className="flex h-full gap-4 px-6 py-5">
                  <span className="shrink-0">
                    <StepNumber value={index + 1} />
                  </span>
                  <div>
                    <h3 className="text-[20px] font-medium tracking-[-0.4px]">{step.title}</h3>
                    <p className="mt-1.5 text-small text-ink-soft">{step.body}</p>
                  </div>
                </Paper>
              </li>
            ))}
          </ol>
        </PageSection>
        <PageSection title={`Shipping every order from Africa, or storing your stock in ${place}`}>
          <div className="grid gap-5 md:grid-cols-2">
            <Paper className="px-6 py-6">
              <Stamp>Shipping each order from Africa</Stamp>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-small">
                {comparison.from.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Paper>
            <NotebookNote tone="lime" tilt="none">
              <Stamp className="text-cocoa">Storing your stock in {place}</Stamp>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-small">
                {comparison.local.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </NotebookNote>
          </div>
        </PageSection>
        {prices ? (
          <PageSection title={`${capitalised(word)} prices in ${place}`}>
            <div className="max-w-[640px]">
              <FeeSummary schedule={prices.schedule} currency={country.currency} locale={country.locale} title={`Prices in ${country.currency}`} />
            </div>
          </PageSection>
        ) : null}
        <FaqSection items={faq} heading={`Selling from Africa to ${place}: questions brands ask`} />
        <p className="mt-10 text-small text-ink-soft">
          Selling on Shopify or WooCommerce? See how orders reach the hub automatically: <Link href={storePlatformPath("shopify")}>Shopify fulfilment</Link> ·{" "}
          <Link href={storePlatformPath("woocommerce")}>WooCommerce fulfilment</Link>.
        </p>
        <p className="mt-3 text-small text-ink-soft">
          Not selling from Africa? See{" "}
          <Link href={countryPath(country)}>
            {word} in {place}
          </Link>{" "}
          for every seller.
        </p>
      </main>
      <MarketingFooter />
    </>
  );
}
