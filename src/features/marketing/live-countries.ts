import type { HubView, PartnerProgrammeView, PublicCountry, PublicPriceListView } from "@/shared";

import { fetchPublic } from "@/lib/api/public-server";

import { type OrderCost, orderCost, POSTAGE_FROM_MINOR } from "./order-cost";

async function publicJson<T>(path: string, fallback: T): Promise<T> {
  return (await fetchPublic<T>(path)) ?? fallback;
}

export function fetchLiveCountries(): Promise<PublicCountry[]> {
  return publicJson<PublicCountry[]>("/v1/countries", []);
}

export function fetchHubs(): Promise<HubView[]> {
  return publicJson<HubView[]>("/v1/public/hubs", []);
}

export function fetchPartnerProgrammes(): Promise<PartnerProgrammeView[]> {
  return publicJson<PartnerProgrammeView[]>("/v1/public/partner-programme", []);
}

export function listNames(names: readonly string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export interface MarketCost {
  countryCode: string;
  countryName: string;
  cost: OrderCost;
}

export async function fetchMarketCosts(hubs: readonly HubView[]): Promise<MarketCost[]> {
  const priced = await Promise.all(
    hubs
      .filter((hub) => POSTAGE_FROM_MINOR[hub.countryCode])
      .map(async (hub) => {
        const prices = await fetchPublic<PublicPriceListView>(`/v1/public/prices/${hub.countryCode}`);
        const cost = prices ? orderCost(prices) : null;
        return cost ? [{ countryCode: hub.countryCode, countryName: hub.countryName, cost }] : [];
      }),
  );
  return priced.flat();
}
