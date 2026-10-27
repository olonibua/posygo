import { cache } from "react";

import type { HubView, PublicCountry, PublicPriceListView } from "@/shared";

import { fetchPublic, loadPublic } from "@/lib/api/public-server";

import { findBySlug } from "./markets";

export interface Market {
  country: PublicCountry;
  hub: HubView | null;
  prices: PublicPriceListView | null;
}

export class MarketsUnavailableError extends Error {
  constructor() {
    super("Market details couldn't be loaded");
  }
}

export const loadLiveCountries = cache(async (): Promise<PublicCountry[]> => {
  const result = await loadPublic<PublicCountry[]>("/v1/countries");
  if (result.kind !== "found") {
    throw new MarketsUnavailableError();
  }
  return result.data.filter((country) => country.status === "LIVE");
});

const loadHubs = cache(async (): Promise<HubView[]> => (await fetchPublic<HubView[]>("/v1/public/hubs")) ?? []);

const loadPrices = cache((countryCode: string) => fetchPublic<PublicPriceListView>(`/v1/public/prices/${countryCode}`));

async function marketFor(country: PublicCountry): Promise<Market> {
  const [hubs, prices] = await Promise.all([loadHubs(), loadPrices(country.code)]);
  return { country, hub: hubs.find((hub) => hub.countryCode === country.code) ?? null, prices };
}

export async function loadMarkets(): Promise<Market[]> {
  return Promise.all((await loadLiveCountries()).map(marketFor));
}

export async function loadMarket(slug: string): Promise<Market | null> {
  const country = findBySlug(await loadLiveCountries(), slug);
  return country ? marketFor(country) : null;
}
