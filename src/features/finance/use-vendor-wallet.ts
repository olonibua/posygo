"use client";

import type { LedgerEntryView, TopUpQuote, TopUpStarted, TopUpView, VendorFeesView, WalletView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { apiRequest } from "@/lib/api/client";

export const VENDOR_WALLET_KEY = ["vendor", "wallet"] as const;

export function useVendorWallet(enabled = true) {
  return useQuery({ queryKey: VENDOR_WALLET_KEY, queryFn: () => apiRequest<WalletView>("/v1/vendor/wallet"), enabled });
}

export function useVendorFees() {
  return useQuery({ queryKey: ["vendor", "fees"], queryFn: () => apiRequest<VendorFeesView>("/v1/vendor/fees"), staleTime: 300_000 });
}

export function useWalletActivity() {
  const ledger = useQuery({ queryKey: [...VENDOR_WALLET_KEY, "ledger"], queryFn: () => apiRequest<LedgerEntryView[]>("/v1/vendor/wallet/ledger") });
  const topUps = useQuery({
    queryKey: [...VENDOR_WALLET_KEY, "top-ups"],
    queryFn: () => apiRequest<TopUpView[]>("/v1/vendor/wallet/top-ups"),
    refetchInterval: (query) => (query.state.data?.some(isAwaitingPayment) ? POLL_MS : false),
  });
  return { ledger, topUps };
}

const POLL_MS = 4000;
const CHECKOUT_WINDOW_MS = 60 * 60 * 1000;

function isAwaitingPayment(topUp: TopUpView): boolean {
  return topUp.status === "PENDING" && Date.now() - new Date(topUp.createdAt).getTime() < CHECKOUT_WINDOW_MS;
}

export function useRefreshWallet() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: VENDOR_WALLET_KEY }), [queryClient]);
}

export function useRefreshWhenPaid(paidCount: number | undefined) {
  const refresh = useRefreshWallet();
  const seen = useRef(paidCount);
  useEffect(() => {
    if (paidCount === undefined || seen.current === paidCount) {
      return;
    }
    const first = seen.current === undefined;
    seen.current = paidCount;
    if (!first) {
      void refresh();
    }
  }, [paidCount, refresh]);
}

export function useTopUp() {
  const quote = useMutation({ mutationFn: (amountMinor: number) => apiRequest<TopUpQuote>("/v1/vendor/wallet/top-ups/quote", { method: "POST", body: { amountMinor } }) });
  const start = useMutation({ mutationFn: (amountMinor: number) => apiRequest<TopUpStarted>("/v1/vendor/wallet/top-ups", { method: "POST", body: { amountMinor } }) });
  return { quote, start };
}

export function useWalletSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lowBalanceThresholdMinor: number) => apiRequest<WalletView>("/v1/vendor/wallet/settings", { method: "PUT", body: { lowBalanceThresholdMinor } }),
    onSuccess: (wallet) => queryClient.setQueryData(VENDOR_WALLET_KEY, wallet),
  });
}

export function useSandboxPayment() {
  const refresh = useRefreshWallet();
  return useMutation({ mutationFn: (topUpId: string) => apiRequest<TopUpView[]>(`/v1/vendor/wallet/top-ups/${topUpId}/sandbox-pay`, { method: "POST" }), onSuccess: () => void refresh() });
}

const CHECKOUT_HOSTS = ["checkout.stripe.com"];

export function safeCheckoutUrl(redirectUrl: string): string | null {
  try {
    const url = new URL(redirectUrl, window.location.origin);
    if (url.origin === window.location.origin || (url.protocol === "https:" && CHECKOUT_HOSTS.includes(url.hostname))) {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}
