import { currencyDefinition, type PublicProductView, type PublicStoreView } from "@/shared";

import type { JsonLdThing } from "@/components/seo/json-ld";

import { apiAssetUrl } from "./api/client";
import { BRAND } from "./brand";
import { absoluteUrl } from "./site";

const ORGANIZATION_ID = absoluteUrl("/#organization");

export function organization(): JsonLdThing {
  return { "@type": "Organization", "@id": ORGANIZATION_ID, name: BRAND.name, url: absoluteUrl("/"), logo: absoluteUrl("/brand/flower-mark.svg"), description: BRAND.description };
}

export function website(): JsonLdThing {
  return { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: BRAND.name, url: absoluteUrl("/"), publisher: { "@id": ORGANIZATION_ID } };
}

export function faqPage(items: ReadonlyArray<{ question: string; answer: string }>): JsonLdThing {
  return { "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}

export function fulfilmentService(name: string, description: string, areaServed: readonly string[], path: string): JsonLdThing {
  return {
    "@type": "Service",
    name,
    description,
    serviceType: "Order fulfilment and warehousing",
    url: absoluteUrl(path),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: areaServed.map((country) => ({ "@type": "Country", name: country })),
  };
}

export function breadcrumbs(trail: ReadonlyArray<{ name: string; path: string }>): JsonLdThing {
  return { "@type": "BreadcrumbList", itemListElement: trail.map((step, index) => ({ "@type": "ListItem", position: index + 1, name: step.name, item: absoluteUrl(step.path) })) };
}

function majorAmount(amountMinor: number, currency: string): string {
  const digits = currencyDefinition(currency).minorUnits;
  return (amountMinor / 10 ** digits).toFixed(digits);
}

function product(item: PublicProductView, storePath: string): JsonLdThing {
  return {
    "@type": "Product",
    name: item.name,
    ...(item.description ? { description: item.description } : {}),
    ...(item.category ? { category: item.category } : {}),
    ...(item.imageUrl ? { image: apiAssetUrl(item.imageUrl) } : {}),
    brand: { "@type": "Brand", name: item.store.displayName },
    offers: {
      "@type": "Offer",
      price: majorAmount(item.priceMinor, item.currency),
      priceCurrency: item.currency,
      availability: item.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(storePath),
    },
  };
}

export function storeGraph(store: PublicStoreView): JsonLdThing[] {
  const path = `/store/${store.slug}`;
  return [
    { "@type": "OnlineStore", name: store.displayName, url: absoluteUrl(path), ...(store.about ? { description: store.about } : {}), parentOrganization: { "@id": ORGANIZATION_ID } },
    { "@type": "ItemList", name: `${store.displayName} products`, itemListElement: store.products.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: product(item, path) })) },
    breadcrumbs([
      { name: BRAND.name, path: "/" },
      { name: "Marketplace", path: "/marketplace" },
      { name: store.displayName, path },
    ]),
  ];
}

export function marketplaceGraph(products: readonly PublicProductView[]): JsonLdThing {
  return {
    "@type": "ItemList",
    name: `${BRAND.name} marketplace`,
    itemListElement: products.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: product(item, `/store/${item.store.slug}`) })),
  };
}

export function priceOffers(currency: string, offers: ReadonlyArray<{ name: string; amountMinor: number }>): JsonLdThing {
  return {
    "@type": "OfferCatalog",
    name: `${BRAND.name} prices in ${currency}`,
    itemListElement: offers.map((offer) => ({ "@type": "Offer", name: offer.name, price: majorAmount(offer.amountMinor, currency), priceCurrency: currency })),
  };
}

export function article(input: { title: string; description: string; path: string; updated: string }): JsonLdThing {
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    dateModified: input.updated,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };
}
