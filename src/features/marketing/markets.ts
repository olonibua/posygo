import type { PublicCountry } from "@/shared";

const AMERICAN_SPELLING = new Set(["US"]);

export function fulfilmentWord(countryCode: string): "fulfillment" | "fulfilment" {
  return AMERICAN_SPELLING.has(countryCode) ? "fulfillment" : "fulfilment";
}

export function countrySlug(country: Pick<PublicCountry, "name">): string {
  return country.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function countryPath(country: Pick<PublicCountry, "name">): string {
  return `/fulfilment/${countrySlug(country)}`;
}

export function findBySlug(countries: readonly PublicCountry[], slug: string): PublicCountry | undefined {
  return countries.find((country) => countrySlug(country) === slug);
}

export function capitalised(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

const NEEDS_THE = /^(United |Czech Republic|Dominican Republic|Netherlands|Philippines|Bahamas|Gambia|Maldives)/;
const SHORT_NAMES: Readonly<Record<string, string>> = { US: "US", GB: "UK", AE: "UAE" };

export function countryPhrase(country: Pick<PublicCountry, "name">): string {
  return NEEDS_THE.test(country.name) ? `the ${country.name}` : country.name;
}

export function shortName(countryCode: string): string | undefined {
  return SHORT_NAMES[countryCode];
}
