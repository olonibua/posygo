"use client";

import type { PublicCountry, PublicProductView } from "@/shared";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";

import { useMarketplace } from "../use-storefront";
import { ProductCard } from "./shop-parts";

interface MarketplaceProps {
  countries: PublicCountry[];
  initial?: { countryCode: string; products: PublicProductView[] };
}

export function MarketplacePage({ countries, initial }: MarketplaceProps) {
  const router = useRouter();
  const requested = useSearchParams().get("country")?.toUpperCase();
  const country = countries.find((entry) => entry.code === requested) ?? countries[0];
  const products = useMarketplace(country?.code ?? "", undefined, initial?.countryCode === country?.code ? initial?.products : undefined);

  if (!country) {
    return <EmptyState title="No stores open yet" body="Stores open here as soon as our first markets go live." />;
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Marketplace" title="Shop independent sellers" lead="Every order is packed and sent from a warehouse near you, with tracking from the moment it leaves." />
      {countries.length > 1 ? (
        <FilterTabs
          label="Country"
          options={countries.map((entry) => ({ value: entry.code, label: entry.name }))}
          value={country.code}
          onChange={(code) => router.replace(`/marketplace?country=${code}`, { scroll: false })}
        />
      ) : null}
      {products.isLoading ? (
        <LoadingRows columns={4} />
      ) : (products.data ?? []).length === 0 ? (
        <EmptyState title={`No stores in ${country.name} yet`} body="Sellers are setting up. Check back soon." />
      ) : (
        <ul className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.data!.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} slug={product.store.slug} locale={country.locale} showStore />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
