"use client";

import type { BuyerView, StorefrontOrderView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiRequest } from "@/lib/api/client";

const KEY = ["buyer"] as const;
const PUBLIC = { authenticated: false } as const;

export function useBuyer() {
  return useQuery({
    queryKey: [...KEY, "me"],
    queryFn: async () => {
      try {
        return await apiRequest<BuyerView>("/v1/buyer/me", PUBLIC);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function useBuyerOrders(enabled: boolean) {
  return useQuery({ queryKey: [...KEY, "orders"], queryFn: () => apiRequest<StorefrontOrderView[]>("/v1/buyer/orders", PUBLIC), enabled });
}

export function useSignInLink() {
  return useMutation({ mutationFn: (email: string) => apiRequest<{ status: string }>("/v1/buyer/auth/link", { ...PUBLIC, method: "POST", body: { email } }) });
}

export function useStartBuyerSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => apiRequest<BuyerView>("/v1/buyer/auth/session", { ...PUBLIC, method: "POST", body: { token } }),
    onSuccess: (buyer) => queryClient.setQueryData([...KEY, "me"], buyer),
  });
}

export function useBuyerSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>("/v1/buyer/auth/sign-out", { ...PUBLIC, method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData([...KEY, "me"], null);
      queryClient.removeQueries({ queryKey: [...KEY, "orders"] });
    },
  });
}

export function useRequestReturn(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => apiRequest<StorefrontOrderView>(`/v1/buyer/orders/${orderId}/returns`, { ...PUBLIC, method: "POST", body: { reason } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...KEY, "orders"] }),
  });
}
