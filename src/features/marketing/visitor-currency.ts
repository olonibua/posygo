import { isSupportedCurrency } from "@/shared";

const EURO_COUNTRIES = ["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"];

const CURRENCY_BY_COUNTRY: Readonly<Record<string, string>> = {
  ...Object.fromEntries(EURO_COUNTRIES.map((code) => [code, "EUR"])),
  AE: "AED",
  AU: "AUD",
  CA: "CAD",
  GB: "GBP",
  GH: "GHS",
  JP: "JPY",
  KE: "KES",
  NG: "NGN",
  US: "USD",
  ZA: "ZAR",
};

export interface VisitorCurrency {
  countryCode: string;
  currency: string;
  rate: number;
}

export function currencyForCountry(countryCode: string | null): string | null {
  return countryCode ? (CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] ?? null) : null;
}

export function readRate(body: unknown, currency: string): number | null {
  const rates = (body as { result?: string; rates?: Record<string, unknown> } | null)?.rates;
  const rate = rates?.[currency];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function isBaseCurrency(code: string | null): code is string {
  return code !== null && /^[A-Z]{3}$/.test(code) && isSupportedCurrency(code);
}
