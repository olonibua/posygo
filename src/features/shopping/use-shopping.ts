"use client";

import type {
  DestinationView,
  ShoppingArrivalInput,
  ShoppingCheckoutInput,
  ShoppingPurchaseInput,
  ShoppingQuoteInput,
  ShoppingRequestInput,
  ShoppingRequestView,
  ShoppingStartedView,
  ShoppingStatus,
} from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const PUBLIC = { authenticated: false } as const;
const BUYER_KEY = ["buyer", "shopping"] as const;
const STAFF_KEY = ["shopping"] as const;

export function useShoppingDestinations(countryCode: string) {
  return useQuery({
    queryKey: ["public", "shopping-destinations", countryCode],
    queryFn: () => apiRequest<DestinationView[]>(`/v1/public/shopping/destinations/${countryCode}`, PUBLIC),
    enabled: /^[A-Z]{2}$/.test(countryCode),
  });
}

export function useSendShoppingRequest() {
  return useMutation({ mutationFn: (input: ShoppingRequestInput) => apiRequest<{ reference: string }>("/v1/public/shopping", { ...PUBLIC, method: "POST", body: input }) });
}

export function useBuyerShopping(enabled: boolean) {
  return useQuery({ queryKey: BUYER_KEY, queryFn: () => apiRequest<ShoppingRequestView[]>("/v1/buyer/shopping", PUBLIC), enabled });
}

export function useBuyerShoppingRequest(requestId: string) {
  return useQuery({ queryKey: [...BUYER_KEY, requestId], queryFn: () => apiRequest<ShoppingRequestView>(`/v1/buyer/shopping/${requestId}`, PUBLIC), enabled: Boolean(requestId), retry: false });
}

export function useShoppingCheckout(requestId: string) {
  return useMutation({ mutationFn: (input: ShoppingCheckoutInput) => apiRequest<ShoppingStartedView>(`/v1/buyer/shopping/${requestId}/checkout`, { ...PUBLIC, method: "POST", body: input }) });
}

export function useCancelShopping(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<ShoppingRequestView>(`/v1/buyer/shopping/${requestId}/cancel`, { ...PUBLIC, method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUYER_KEY });
      toast.success("Request cancelled");
    },
  });
}

export function useShoppingSandboxPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) => apiRequest<void>(`/v1/buyer/shopping/by-reference/${encodeURIComponent(reference)}/sandbox-payment`, { ...PUBLIC, method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: BUYER_KEY }),
  });
}

export type ShoppingSide = "admin" | "warehouse";

export function useStaffShopping(side: ShoppingSide, status?: ShoppingStatus) {
  return useQuery({
    queryKey: [...STAFF_KEY, side, status ?? "ALL"],
    queryFn: () => apiRequest<ShoppingRequestView[]>(`/v1/${side}/shopping${side === "admin" && status ? `?status=${status}` : ""}`),
  });
}

function useStaffAction<Input>(side: ShoppingSide, requestId: string, action: string, announce: string, body?: (input: Input) => unknown) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => apiRequest<ShoppingRequestView>(`/v1/${side}/shopping/${requestId}/${action}`, { method: "POST", body: body ? body(input) : undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      toast.success(announce);
    },
  });
}

export const useQuoteShopping = (requestId: string) => useStaffAction<ShoppingQuoteInput>("admin", requestId, "quote", "Price sent to the buyer", (input) => input);
export const usePurchaseShopping = (requestId: string) => useStaffAction<ShoppingPurchaseInput>("admin", requestId, "purchase", "Purchases recorded", (input) => input);
export const useStaffCancelShopping = (requestId: string) => useStaffAction<string>("admin", requestId, "cancel", "Request cancelled", (reason) => ({ reason }));
export const useRetryShoppingRefund = (requestId: string) => useStaffAction<void>("admin", requestId, "refund-retry", "Refund sent");
export const useShoppingArrival = (requestId: string) => useStaffAction<ShoppingArrivalInput>("warehouse", requestId, "arrival", "Items booked in", (input) => input);
export const useShipShopping = (requestId: string) => useStaffAction<void>("warehouse", requestId, "ship", "Label bought, parcel on its way");
export const useShoppingDelivered = (requestId: string) => useStaffAction<void>("warehouse", requestId, "delivered", "Marked as delivered");

export function useShoppingPhoto(requestId: string) {
  return useMutation({ mutationFn: (fileId: string) => apiRequest<{ url: string }>(`/v1/admin/shopping/${requestId}/photos/${fileId}`) });
}

export function useConfirmShopping() {
  return useMutation({ mutationFn: (token: string) => apiRequest<{ reference: string }>("/v1/public/shopping/confirm", { ...PUBLIC, method: "POST", body: { token } }) });
}
