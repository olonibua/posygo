import type { Metadata } from "next";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { fetchLiveCountries } from "@/features/marketing/live-countries";
import { ShopForMePage } from "@/features/shopping/shop-for-me-page";

export const metadata: Metadata = { title: "Shop for me", description: "Send us links to things you want. We buy them and send them to you in one parcel." };

export default async function Page() {
  const countries = await fetchLiveCountries();
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto max-w-[880px] px-4 py-14 sm:px-8">
        <ShopForMePage countries={countries} />
      </main>
      <MarketingFooter />
    </>
  );
}
