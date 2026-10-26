import type { HubView, PartnerProgrammeView, PublicCountry } from "@/shared";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function publicJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    return response.ok ? ((await response.json()) as T) : fallback;
  } catch {
    return fallback;
  }
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
