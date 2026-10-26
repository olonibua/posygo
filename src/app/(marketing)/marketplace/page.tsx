import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { fetchLiveCountries } from "@/features/marketing/live-countries";
import { MarketplacePage } from "@/features/storefront/shop/marketplace-page";

export const metadata: Metadata = { title: "Marketplace", description: "Shop independent sellers. Every order packed and sent from a warehouse near you." };

export default async function Page() {
  const countries = await fetchLiveCountries();
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto max-w-container px-4 py-14 sm:px-8">
        <Suspense>
          <MarketplacePage countries={countries} />
        </Suspense>
      </main>
      <MarketingFooter />
    </>
  );
}
