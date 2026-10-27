import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { StorePage } from "@/features/storefront/shop/store-page";
import { loadPublic } from "@/lib/api/public-server";
import { PRIVATE_PAGE, publicPage } from "@/lib/site";
import { storeGraph } from "@/lib/structured-data";
import { type PublicStoreView, storefrontSlugSchema } from "@/shared";

type Props = { params: Promise<{ slug: string }> };

const loadStore = cache((slug: string) => (storefrontSlugSchema.safeParse(slug).success ? loadPublic<PublicStoreView>(`/v1/public/stores/${slug}`) : Promise.resolve({ kind: "missing" as const })));

function describe(store: PublicStoreView): string {
  const about = store.about?.trim();
  return about && about.length >= 50
    ? about.slice(0, 160)
    : `Shop ${store.displayName}. ${store.products.length} products, packed and tracked from a local hub${store.returnsAllowed ? `, with ${store.returnWindowDays}-day returns` : ""}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadStore(slug);
  if (result.kind !== "found") {
    return { title: "Store", ...PRIVATE_PAGE };
  }
  return publicPage({ title: result.data.displayName, description: describe(result.data), path: `/store/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const result = await loadStore(slug);
  if (result.kind === "missing") {
    notFound();
  }
  const store = result.kind === "found" ? result.data : undefined;
  return (
    <>
      {store ? <JsonLd data={storeGraph(store)} /> : null}
      <Suspense>
        <StorePage slug={slug} initialStore={store} />
      </Suspense>
    </>
  );
}
