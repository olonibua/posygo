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
  { path: "/", title: "Posygo", summary: "Ecommerce fulfilment that gets your products closer to your customers.", priority: 1 },
  { path: "/how-it-works", title: "How it works", summary: "How your stock gets closer to your customers and every order reaches them in days.", priority: 0.9 },
  { path: "/pricing", title: "Pricing", summary: "Current prices per box, per order and for shipping in each country.", priority: 0.9 },
  { path: "/fulfilment", title: "Where we deliver", summary: "The countries where we store your stock and deliver your orders.", priority: 0.9 },
  { path: "/signup", title: "Sign up", summary: "Create a seller account.", priority: 0.8 },
  { path: "/partners", title: "Partners", summary: "Work with Posygo.", priority: 0.3 },
  { path: "/marketplace", title: "Marketplace", summary: "Products from independent sellers, delivered in days.", priority: 0.7 },
  { path: "/guides", title: "Guides", summary: "Guides to selling abroad and getting orders to customers fast.", priority: 0.6 },
  { path: "/track", title: "Track a parcel", summary: "Track an order sent by Posygo.", priority: 0.4 },
  { path: "/legal/terms", title: "Terms of service", summary: "Terms of service.", priority: 0.2 },
  { path: "/legal/privacy", title: "Privacy policy", summary: "Privacy policy.", priority: 0.2 },
];

export async function sitePages(): Promise<SitePage[]> {
  const [countries, stores] = await Promise.all([fetchPublic<PublicCountry[]>("/v1/countries"), fetchPublic<PublicStoreListing[]>("/v1/public/stores")]);
  const markets = (countries ?? []).map((country) => ({
    path: countryPath(country),
    title: `${capitalised(fulfilmentWord(country.code))} in ${countryPhrase(country)}`,
    summary: `Prices and how ${fulfilmentWord(country.code)} works in ${countryPhrase(country)}.`,
    priority: 0.9,
  }));
  const guides = GUIDES.map((guide) => ({ path: `/guides/${guide.slug}`, title: guide.title, summary: guide.description, updated: guide.updated, priority: 0.6 }));
  const shops = (stores ?? []).map((store) => ({ path: `/store/${store.slug}`, title: store.displayName, summary: `An independent shop on Posygo.`, updated: store.updatedAt, priority: 0.5 }));
  return [...CORE_PAGES, ...markets, ...guides, ...shops];
}
