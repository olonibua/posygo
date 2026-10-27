"use client";

import type {
  CheckoutInput,
  CheckoutStartedView,
  ListingView,
  ProductListingInput,
  PublicProductView,
  PublicStoreView,
  QuoteInput,
  QuoteView,
  StorefrontOrderStatus,
  StorefrontOrderView,
  StorefrontSettingsInput,
  StorefrontSettingsView,
} from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const VENDOR_KEY = ["vendor", "storefront"] as const;
const SETTINGS_KEY = [...VENDOR_KEY, "settings"] as const;
const ADMIN_KEY = ["admin", "storefront-orders"] as const;
const PENDING_POLL_MS = 2000;
const PUBLIC = { authenticated: false } as const;

type Method = "POST" | "PUT";

const sameKey = (left: readonly unknown[], right: readonly unknown[]) => left.length === right.length && left.every((part, index) => part === right[index]);

function useStoreMutation<Input, Output>(key: readonly string[], request: (input: Input) => { path: string; method?: Method; body?: unknown }, announce?: string, resultKey?: readonly string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const { path, method = "POST", body } = request(input);
      return apiRequest<Output>(path, { method, body });
    },
    onSuccess: async (result) => {
      if (resultKey) {
        await queryClient.cancelQueries({ queryKey: resultKey });
        queryClient.setQueryData(resultKey, result);
      }
      void queryClient.invalidateQueries({ queryKey: key, predicate: (query) => !resultKey || !sameKey(query.queryKey, resultKey) });
      if (announce) {
        toast.success(announce);
      }
    },
  });
}

export function useStorefrontSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: () => apiRequest<StorefrontSettingsView>("/v1/vendor/storefront") });
}

export function useListings() {
  return useQuery({ queryKey: [...VENDOR_KEY, "listings"], queryFn: () => apiRequest<ListingView[]>("/v1/vendor/storefront/listings") });
}

export function useVendorStoreOrders(status?: StorefrontOrderStatus) {
  return useQuery({ queryKey: [...VENDOR_KEY, "orders", status ?? "ALL"], queryFn: () => apiRequest<StorefrontOrderView[]>(`/v1/vendor/storefront/orders${status ? `?status=${status}` : ""}`) });
}

export function useSaveStorefront() {
  return useStoreMutation<StorefrontSettingsInput, StorefrontSettingsView>(VENDOR_KEY, (input) => ({ path: "/v1/vendor/storefront", method: "PUT", body: input }), "Store details saved", SETTINGS_KEY);
}

export function useStoreAction(action: "go-live" | "pause" | "payouts/refresh", announce: string) {
  return useStoreMutation<void, StorefrontSettingsView>(VENDOR_KEY, () => ({ path: `/v1/vendor/storefront/${action}` }), announce, SETTINGS_KEY);
}

export function usePayoutSetup() {
  return useStoreMutation<void, { url: string }>(VENDOR_KEY, () => ({ path: "/v1/vendor/storefront/payouts/setup" }));
}

export function useSetListing() {
  return useStoreMutation<{ productId: string; input: ProductListingInput }, ListingView[]>(VENDOR_KEY, ({ productId, input }) => ({
    path: `/v1/vendor/storefront/listings/${productId}`,
    method: "PUT",
    body: input,
  }));
}

export function usePublicStore(slug: string, initialStore?: PublicStoreView) {
  return useQuery({
    queryKey: ["public", "store", slug],
    queryFn: () => apiRequest<PublicStoreView>(`/v1/public/stores/${encodeURIComponent(slug)}`, PUBLIC),
    initialData: initialStore,
    retry: false,
  });
}

export function useMarketplace(countryCode: string, category?: string, initialProducts?: PublicProductView[]) {
  return useQuery({
    queryKey: ["public", "marketplace", countryCode, category ?? "ALL"],
    queryFn: () => apiRequest<PublicProductView[]>(`/v1/public/marketplace/${countryCode}${category ? `?category=${encodeURIComponent(category)}` : ""}`, PUBLIC),
    initialData: category ? undefined : initialProducts,
  });
}

export function useQuote(slug: string) {
  return useMutation({ mutationFn: (input: QuoteInput) => apiRequest<QuoteView>(`/v1/public/stores/${encodeURIComponent(slug)}/quote`, { ...PUBLIC, method: "POST", body: input }) });
}

export function useCheckout(slug: string) {
  return useMutation({ mutationFn: (input: CheckoutInput) => apiRequest<CheckoutStartedView>(`/v1/public/stores/${encodeURIComponent(slug)}/checkout`, { ...PUBLIC, method: "POST", body: input }) });
}

export function useReceipt(orderId: string) {
  return useQuery({
    queryKey: ["public", "receipt", orderId],
    queryFn: () => apiRequest<StorefrontOrderView>(`/v1/public/storefront-orders/${orderId}`, PUBLIC),
    refetchInterval: (query) => (query.state.data?.status === "PENDING_PAYMENT" ? PENDING_POLL_MS : false),
    enabled: orderId !== "",
    retry: false,
  });
}

export function useSandboxPayment() {
  return useMutation({
    mutationFn: (reference: string) => apiRequest<StorefrontOrderView>(`/v1/public/storefront-orders/${encodeURIComponent(reference)}/sandbox-payment`, { ...PUBLIC, method: "POST" }),
  });
}

export function useAdminStoreOrders(status?: StorefrontOrderStatus) {
  return useQuery({ queryKey: [...ADMIN_KEY, status ?? "ALL"], queryFn: () => apiRequest<StorefrontOrderView[]>(`/v1/admin/storefront-orders${status ? `?status=${status}` : ""}`) });
}

export function useAdminStoreOrder(orderId: string | null) {
  return useQuery({ queryKey: [...ADMIN_KEY, "one", orderId], queryFn: () => apiRequest<StorefrontOrderView>(`/v1/admin/storefront-orders/${orderId}`), enabled: Boolean(orderId) });
}

export function useRefundStoreOrder(orderId: string) {
  return useStoreMutation<{ amountMinor: number; note: string }, StorefrontOrderView>(
    ADMIN_KEY,
    (input) => ({ path: `/v1/admin/storefront-orders/${orderId}/refund`, body: input }),
    "Refund sent to the buyer's card",
  );
}

export function useRetryPayout(orderId: string) {
  return useStoreMutation<void, StorefrontOrderView>(ADMIN_KEY, () => ({ path: `/v1/admin/storefront-orders/${orderId}/payout-retry` }), "Payout retried");
}
