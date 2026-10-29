"use client";

import type { TaxCountryView, TaxOverviewView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const KEY = ["admin", "tax"];

export function useTaxOverview() {
  return useQuery({ queryKey: KEY, queryFn: () => apiRequest<TaxOverviewView>("/v1/admin/tax") });
}

export function useTaxCountry(code: string) {
  return useQuery({ queryKey: [...KEY, code], queryFn: () => apiRequest<TaxCountryView>(`/v1/admin/tax/countries/${code}`) });
}

export function useTaxChange<Input>(request: (input: Input) => { path: string; method: "POST" | "PATCH" }, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input & object) => {
      const { path, method } = request(input);
      return apiRequest(path, { method, body: input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      onDone?.();
    },
  });
}
