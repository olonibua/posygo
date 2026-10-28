"use client";

import type { ApiKeyCreatedView, ApiKeyView, CreateOrdersInput, ImportResultView, OrderDetailView, OrderEstimateView, OrderSummaryView, VendorOrderActionInput } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VENDOR_WALLET_KEY } from "@/features/finance/use-vendor-wallet";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { apiRequest } from "@/lib/api/client";

export const VENDOR_ORDERS_KEY = ["vendor", "orders"] as const;

export function useVendorOrders(search: string) {
  const { code, ready, path } = useCountryScope();
  const query = search ? `?q=${encodeURIComponent(search)}` : "";
  return useQuery({ queryKey: [...VENDOR_ORDERS_KEY, "list", code, search], queryFn: () => apiRequest<OrderSummaryView[]>(path(`/v1/vendor/orders${query}`)), enabled: ready });
}

export function useVendorOrder(orderId: string) {
  const queryClient = useQueryClient();
  const key = [...VENDOR_ORDERS_KEY, orderId];
  const order = useQuery({ queryKey: key, queryFn: () => apiRequest<OrderDetailView>(`/v1/vendor/orders/${orderId}`) });
  const act = useMutation({
    mutationFn: (input: VendorOrderActionInput) => apiRequest<OrderDetailView>(`/v1/vendor/orders/${orderId}/actions`, { method: "POST", body: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(key, next);
      void queryClient.invalidateQueries({ queryKey: [...VENDOR_ORDERS_KEY, "list"] });
      void queryClient.invalidateQueries({ queryKey: VENDOR_WALLET_KEY });
    },
  });
  return { order, act };
}

export function usePlaceOrders() {
  const queryClient = useQueryClient();
  const { path } = useCountryScope();
  return useMutation({
    mutationFn: (input: CreateOrdersInput) => apiRequest<OrderSummaryView[]>(path("/v1/vendor/orders"), { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VENDOR_ORDERS_KEY });
      void queryClient.invalidateQueries({ queryKey: VENDOR_WALLET_KEY });
    },
  });
}

export function useOrderEstimate(units: number) {
  const { code, ready, path } = useCountryScope();
  return useQuery({
    queryKey: [...VENDOR_ORDERS_KEY, "estimate", code, units],
    queryFn: () => apiRequest<OrderEstimateView>(path("/v1/vendor/orders/estimate"), { method: "POST", body: { units } }),
    enabled: ready && units > 0,
  });
}

export function useOrderImports() {
  const queryClient = useQueryClient();
  const { code, ready, path } = useCountryScope();
  const history = useQuery({ queryKey: [...VENDOR_ORDERS_KEY, "imports", code], queryFn: () => apiRequest<ImportResultView[]>(path("/v1/vendor/orders/imports")), enabled: ready });
  const run = useMutation({
    mutationFn: (input: { filename: string; csv: string }) => apiRequest<ImportResultView>(path("/v1/vendor/orders/imports"), { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VENDOR_ORDERS_KEY });
      void queryClient.invalidateQueries({ queryKey: VENDOR_WALLET_KEY });
    },
  });
  return { history, run };
}

export function useApiKeys() {
  const queryClient = useQueryClient();
  const key = ["vendor", "integrations", "keys"];
  const keys = useQuery({ queryKey: key, queryFn: () => apiRequest<ApiKeyView[]>("/v1/vendor/integrations/keys") });
  const create = useMutation({
    mutationFn: (name: string) => apiRequest<ApiKeyCreatedView>("/v1/vendor/integrations/keys", { method: "POST", body: { name } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: key }),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => apiRequest<ApiKeyView>(`/v1/vendor/integrations/keys/${id}`, { method: "DELETE" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: key }),
  });
  return { keys, create, revoke };
}
