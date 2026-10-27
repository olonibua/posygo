import type { PublicCountry, PublicStoreListing } from "@/shared";

import { fetchPublic } from "@/lib/api/public-server";

import { GUIDES } from "./guides";
import { capitalised, countryPath, countryPhrase, fulfilmentWord } from "./markets";

export interface SitePage {
  path: string;
  title: string;
  summary: string;
  updated?: string;
  priority: number;
}

const CORE_PAGES: readonly SitePage[] = [
  { path: "/", title: "Posygo", summary: "Local fulfilment hubs for online sellers.", priority: 1 },
  { path: "/how-it-works", title: "How it works", summary: "How stock moves from your supplier to a local hub and on to your customers.", priority: 0.9 },
  { path: "/pricing", title: "Pricing", summary: "Current prices per box, per order and for shipping in each country.", priority: 0.9 },
  { path: "/fulfilment", title: "Hubs by country", summary: "The countries with live fulfilment hubs.", priority: 0.9 },
  { path: "/signup", title: "Sign up", summary: "Create a seller account.", priority: 0.8 },
  { path: "/partners", title: "Become a partner", summary: "Earn from spare space by receiving, storing and packing orders.", priority: 0.7 },
  { path: "/shop-for-me", title: "Shop for me", summary: "We buy from shops in a country we serve and send it to you.", priority: 0.7 },
  { path: "/marketplace", title: "Marketplace", summary: "Products from independent sellers, shipped from local hubs.", priority: 0.7 },
  { path: "/guides", title: "Guides", summary: "Guides to selling abroad and local fulfilment.", priority: 0.6 },
  { path: "/track", title: "Track a parcel", summary: "Track an order shipped from a Posygo hub.", priority: 0.4 },
  { path: "/legal/terms", title: "Terms of service", summary: "Terms of service.", priority: 0.2 },
  { path: "/legal/privacy", title: "Privacy policy", summary: "Privacy policy.", priority: 0.2 },
];

export async function sitePages(): Promise<SitePage[]> {
  const [countries, stores] = await Promise.all([fetchPublic<PublicCountry[]>("/v1/countries"), fetchPublic<PublicStoreListing[]>("/v1/public/stores")]);
  const markets = (countries ?? []).map((country) => ({
    path: countryPath(country),
    title: `${capitalised(fulfilmentWord(country.code))} in ${countryPhrase(country)}`,
    summary: `Local hubs, prices and how ${fulfilmentWord(country.code)} works in ${countryPhrase(country)}.`,
    priority: 0.9,
  }));
  const guides = GUIDES.map((guide) => ({ path: `/guides/${guide.slug}`, title: guide.title, summary: guide.description, updated: guide.updated, priority: 0.6 }));
  const shops = (stores ?? []).map((store) => ({ path: `/store/${store.slug}`, title: store.displayName, summary: `An independent shop on Posygo.`, updated: store.updatedAt, priority: 0.5 }));
  return [...CORE_PAGES, ...markets, ...guides, ...shops];
}
