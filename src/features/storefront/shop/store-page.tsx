"use client";

import type { PublicStoreView } from "@/shared";
import { useSearchParams } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { NotebookNote } from "@/components/ui/surfaces";
import { toneSurface } from "@/components/ui/tone";
import { cn } from "@/lib/cn";
import { formatMoney, localeFor } from "@/lib/format";

import { useBasket } from "../basket-store";
import { usePublicStore } from "../use-storefront";
import { ProductCard, ShopFooter, ShopHeader } from "./shop-parts";

export function StorePage({ slug, initialStore }: { slug: string; initialStore?: PublicStoreView }) {
  const store = usePublicStore(slug, initialStore);
  const lines = useBasket(slug);
  const cancelled = useSearchParams().get("checkout") === "cancelled";
  const data = store.data;
  if (!data) {
    return store.isError ? (
      <main id="main" className="mx-auto max-w-[760px] px-4 py-20">
        <EmptyState title="This store isn't open" body="Check the address, or come back later." />
      </main>
    ) : (
      <main id="main" className="mx-auto max-w-container px-4 py-14 sm:px-8">
        <PageSkeleton label="Opening the store" />
      </main>
    );
  }
  const locale = localeFor(data.countryCode);
  const subtotal = lines.reduce((total, line) => total + line.priceMinor * line.quantity, 0);
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  return (
    <>
      <ShopHeader slug={slug} name={data.displayName} />
      <main id="main" className="mx-auto flex max-w-container flex-col gap-8 px-4 pb-24 pt-4 sm:px-8">
        <section className={cn("motion-rise relative overflow-hidden rounded-tile px-6 py-9 sm:px-10", toneSurface[data.tone])}>
          <img src="/brand/confetti-scatter.svg" alt="" aria-hidden className="pointer-events-none absolute -right-6 -top-4 w-[260px] opacity-60" />
          <h1 className="relative max-w-[720px] text-h1">{data.displayName}</h1>
          {data.about ? <p className="relative mt-3 max-w-[620px] text-lead">{data.about}</p> : null}
          <div className="relative mt-5 flex flex-wrap gap-2">
            <Chip tone="cocoa" size="sm">
              {data.pricesIncludeTax ? "Prices include VAT" : "Tax added at checkout"}
            </Chip>
            <Chip tone="cocoa" size="sm">
              {data.returnsAllowed ? `Returns within ${data.returnWindowDays} days` : "No returns"}
            </Chip>
            <Chip tone="cocoa" size="sm">
              Packed and tracked
            </Chip>
          </div>
        </section>
        {cancelled ? (
          <NotebookNote tone="sky" tilt="none" className="max-w-[640px]">
            <p className="text-small">Payment wasn&apos;t completed, so you haven&apos;t been charged. Your basket is still here.</p>
          </NotebookNote>
        ) : null}
        {data.products.length === 0 ? (
          <EmptyState title="Nothing for sale yet" body="This store hasn't listed any products. Check back soon." />
        ) : (
          <ul className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {data.products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} slug={slug} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </main>
      {count > 0 ? (
        <div className="motion-rise fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 py-3 pl-4 pr-20 backdrop-blur sm:pl-8 sm:pr-24">
          <div className="mx-auto flex max-w-container items-center justify-between gap-4">
            <span className="text-small">
              {count} {count === 1 ? "item" : "items"} · <span className="font-semibold tabular-nums">{formatMoney(subtotal, data.currency, locale)}</span>
            </span>
            <ButtonLink href={`/store/${slug}/checkout`} variant="yellow">
              Check out →
            </ButtonLink>
          </div>
        </div>
      ) : null}
      <ShopFooter name={data.displayName} />
    </>
  );
}
