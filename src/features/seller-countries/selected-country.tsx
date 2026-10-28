"use client";

import { type VendorCountryView, withCountry } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api/client";

export const ALL_COUNTRIES = "ALL";
export const VENDOR_COUNTRIES_KEY = ["vendor", "countries"] as const;
const STORAGE_KEY = "posygo.country";

interface SelectedCountry {
  countries: readonly VendorCountryView[];
  country: VendorCountryView | null;
  allCountries: boolean;
  loading: boolean;
  select: (code: string) => void;
}

const SelectedCountryContext = createContext<SelectedCountry>({ countries: [], country: null, allCountries: false, loading: false, select: () => undefined });

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveChoice(code: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    return;
  }
}

export function SelectedCountryProvider({ children }: { children: ReactNode }) {
  const countries = useQuery({ queryKey: VENDOR_COUNTRIES_KEY, queryFn: () => apiRequest<VendorCountryView[]>("/v1/vendor/countries") });
  const [choice, setChoice] = useState<string | null>(readChoice);
  const select = useCallback((code: string) => {
    setChoice(code);
    saveChoice(code);
  }, []);
  const value = useMemo<SelectedCountry>(() => {
    const list = countries.data ?? [];
    const country = list.find((entry) => entry.code === choice) ?? list.find((entry) => entry.home) ?? list[0] ?? null;
    return { countries: list, country, allCountries: choice === ALL_COUNTRIES && list.length > 0, loading: countries.isLoading, select };
  }, [countries.data, countries.isLoading, choice, select]);
  return <SelectedCountryContext.Provider value={value}>{children}</SelectedCountryContext.Provider>;
}

export function useSelectedCountry(): SelectedCountry {
  return useContext(SelectedCountryContext);
}

export function useCountryScope() {
  const { country } = useSelectedCountry();
  const code = country?.code ?? null;
  const path = useCallback((base: string) => (code ? withCountry(base, code) : base), [code]);
  return { code, ready: code !== null, path };
}
