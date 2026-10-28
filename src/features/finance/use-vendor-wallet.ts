"use client";

import { type LedgerEntryView, type TopUpQuote, type TopUpStarted, type TopUpView, type VendorFeesView, type WalletView, withCountry } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { apiRequest } from "@/lib/api/client";

import { useCountryScope } from "@/features/seller-countries/selected-country";

export const VENDOR_WALLET_KEY = ["vendor", "wallet"] as const;

export function useVendorWallet(enabled = true, countryCode?: string) {
  const selected = useCountryScope();
  const code = countryCode ?? selected.code;
  return useQuery({
    queryKey: [...VENDOR_WALLET_KEY, code],
    queryFn: () => apiRequest<WalletView>(code ? withCountry("/v1/vendor/wallet", code) : "/v1/vendor/wallet"),
    enabled: enabled && code !== null,
  });
}

export function useVendorFees() {
  const { code, ready, path } = useCountryScope();
  return useQuery({ queryKey: ["vendor", "fees", code], queryFn: () => apiRequest<VendorFeesView>(path("/v1/vendor/fees")), enabled: ready, staleTime: 300_000 });
}

export function useWalletActivity() {
  const { code, ready, path } = useCountryScope();
  const ledger = useQuery({ queryKey: [...VENDOR_WALLET_KEY, code, "ledger"], queryFn: () => apiRequest<LedgerEntryView[]>(path("/v1/vendor/wallet/ledger")), enabled: ready });
  const topUps = useQuery({
    queryKey: [...VENDOR_WALLET_KEY, code, "top-ups"],
    queryFn: () => apiRequest<TopUpView[]>(path("/v1/vendor/wallet/top-ups")),
    enabled: ready,
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
  const { path } = useCountryScope();
  const quote = useMutation({ mutationFn: (amountMinor: number) => apiRequest<TopUpQuote>(path("/v1/vendor/wallet/top-ups/quote"), { method: "POST", body: { amountMinor } }) });
  const start = useMutation({ mutationFn: (amountMinor: number) => apiRequest<TopUpStarted>(path("/v1/vendor/wallet/top-ups"), { method: "POST", body: { amountMinor } }) });
  return { quote, start };
}

export function useWalletSettings() {
  const queryClient = useQueryClient();
  const { code, path } = useCountryScope();
  return useMutation({
    mutationFn: (lowBalanceThresholdMinor: number) => apiRequest<WalletView>(path("/v1/vendor/wallet/settings"), { method: "PUT", body: { lowBalanceThresholdMinor } }),
    onSuccess: (wallet) => queryClient.setQueryData([...VENDOR_WALLET_KEY, code], wallet),
  });
}

export function useSandboxPayment() {
  const refresh = useRefreshWallet();
  const { path } = useCountryScope();
  return useMutation({ mutationFn: (topUpId: string) => apiRequest<TopUpView[]>(path(`/v1/vendor/wallet/top-ups/${topUpId}/sandbox-pay`), { method: "POST" }), onSuccess: () => void refresh() });
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
