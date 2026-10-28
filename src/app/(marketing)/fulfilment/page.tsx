import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { NotebookNote } from "@/components/ui/surfaces";
import { loadMarkets } from "@/features/marketing/market-data";
import { capitalised, countryPath, countryPhrase, fulfilmentWord } from "@/features/marketing/markets";
import { PageIntro } from "@/features/marketing/page-intro";
import { BRAND } from "@/lib/brand";
import { formatMoney } from "@/lib/format";
import { publicPage } from "@/lib/site";
import { breadcrumbs, fulfilmentService } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "Ecommerce fulfilment by country: fast delivery to your customers",
  description: "See the countries where Posygo stores your stock and delivers your orders, what it costs and how quickly orders reach your customers.",
  path: "/fulfilment",
});

export default async function FulfilmentIndexPage() {
  const markets = await loadMarkets();
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          fulfilmentService(
            `${BRAND.name} fulfilment`,
            BRAND.description,
            markets.map((market) => market.country.name),
            "/fulfilment",
          ),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Fulfilment", path: "/fulfilment" },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 pb-24 sm:px-8">
        <PageIntro stamp="Where we deliver" title="Fast delivery in the countries you sell to">
          <p>In each country below we store your stock, then pack and deliver every order in days. Pick one to see its prices and how it works there.</p>
        </PageIntro>
        {markets.length === 0 ? (
          <p className="mt-10 text-ink-soft">We&apos;re opening our first countries soon.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((market, index) => (
              <li key={market.country.code}>
                <NotebookNote tone={index % 2 === 0 ? "yellow" : "lime"} tilt={index % 2 === 0 ? "left" : "right"}>
                  <h2 className="mt-1 text-[26px] font-medium tracking-[-0.8px]">
                    <Link href={countryPath(market.country)} className="text-ink">
                      {capitalised(fulfilmentWord(market.country.code))} in {countryPhrase(market.country)}
                    </Link>
                  </h2>
                  <p className="mt-2 text-small">
                    Billed in {market.country.currency}
                    {market.prices ? ` · packing from ${formatMoney(market.prices.schedule.fulfilment.baseMinor, market.country.currency, market.country.locale)} an order` : ""}
                  </p>
                </NotebookNote>
              </li>
            ))}
          </ul>
        )}
      </main>
      <MarketingFooter />
    </>
  );
}
