"use client";

import { currencyDefinition, type MeasurementSystem, type PublicCountry } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export interface Market {
  countryCode: string;
  currency: string;
  locale: string;
  measurementSystem: MeasurementSystem;
  minorUnits: number;
}

export function useMarket(): Market {
  const user = useCurrentUser();
  const countries = useQuery({ queryKey: ["countries", "public"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }), staleTime: 5 * 60 * 1000 });
  const countryCode = user.countryCode ?? "GB";
  const country = countries.data?.find((entry) => entry.code === countryCode);
  const currency = user.currency ?? country?.currency ?? "GBP";
  return {
    countryCode,
    currency,
    locale: country?.locale ?? (countryCode === "US" ? "en-US" : "en-GB"),
    measurementSystem: country?.measurementSystem ?? (countryCode === "US" ? "IMPERIAL" : "METRIC"),
    minorUnits: currencyDefinition(currency).minorUnits,
  };
}
