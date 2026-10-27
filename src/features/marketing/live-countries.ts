import type { HubView, PartnerProgrammeView, PublicCountry } from "@/shared";

import { fetchPublic } from "@/lib/api/public-server";

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
