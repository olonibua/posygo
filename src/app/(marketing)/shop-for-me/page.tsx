import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { fetchLiveCountries } from "@/features/marketing/live-countries";
import { ShopForMePage } from "@/features/shopping/shop-for-me-page";
import { JsonLd } from "@/components/seo/json-ld";
import { BRAND } from "@/lib/brand";
import { absoluteUrl, publicPage } from "@/lib/site";

export const metadata = publicPage({
  title: "Shop for me: we buy from shops abroad and send it to you",
  description: "Paste links to things you want from shops in a country we serve. We price everything up front, buy it once you've paid and send it to you in one tracked parcel.",
  path: "/shop-for-me",
});

export default async function Page() {
  const countries = await fetchLiveCountries();
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={{
          "@type": "Service",
          name: `${BRAND.name} personal shopping`,
          serviceType: "Personal shopping and parcel forwarding",
          description: metadata.description,
          url: absoluteUrl("/shop-for-me"),
          provider: { "@id": absoluteUrl("/#organization") },
          areaServed: countries.map((country) => ({ "@type": "Country", name: country.name })),
        }}
      />
      <main id="main" className="mx-auto max-w-[880px] px-4 py-14 sm:px-8">
        <ShopForMePage countries={countries} />
      </main>
      <MarketingFooter />
    </>
  );
}
