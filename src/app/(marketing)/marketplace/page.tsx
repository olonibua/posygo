import { Suspense } from "react";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchLiveCountries } from "@/features/marketing/live-countries";
import { MarketplacePage } from "@/features/storefront/shop/marketplace-page";
import { fetchPublic } from "@/lib/api/public-server";
import { publicPage } from "@/lib/site";
import { marketplaceGraph } from "@/lib/structured-data";
import type { PublicProductView } from "@/shared";

export const metadata = publicPage({
  title: "Marketplace: shop independent sellers",
  description: "Shop independent brands in one place. Every order is packed close to you and sent with tracking, so it arrives in days, not weeks.",
  path: "/marketplace",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ country?: string }> }) {
  const [countries, { country: requested }] = await Promise.all([fetchLiveCountries(), searchParams]);
  const country = countries.find((entry) => entry.code === requested?.toUpperCase()) ?? countries[0];
  const products = country ? ((await fetchPublic<PublicProductView[]>(`/v1/public/marketplace/${country.code}`, { live: true })) ?? undefined) : undefined;
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto max-w-container px-4 py-14 sm:px-8">
        {products && products.length > 0 ? <JsonLd data={marketplaceGraph(products)} /> : null}
        <Suspense>
          <MarketplacePage countries={countries} initial={country && products ? { countryCode: country.code, products } : undefined} />
        </Suspense>
      </main>
      <MarketingFooter />
    </>
  );
}
