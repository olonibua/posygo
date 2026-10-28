"use client";

import type { ActivationStarted, VendorActivationView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { safeCheckoutUrl } from "@/features/finance/use-vendor-wallet";
import { apiRequest, refreshSession } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const ACTIVATION_KEY = ["vendor", "activation"] as const;

const POLL_MS = 4000;

export function useActivation({ enabled = true, watching = false }: { enabled?: boolean; watching?: boolean } = {}) {
  const user = useCurrentUser();
  const activation = useQuery({
    queryKey: ACTIVATION_KEY,
    queryFn: () => apiRequest<VendorActivationView>("/v1/vendor/activation"),
    enabled,
    refetchInterval: (query) => (watching && query.state.data?.state === "DUE" ? POLL_MS : false),
  });
  const live = activation.data?.state === "LIVE";
  useEffect(() => {
    if (live && user.vendorStatus !== "ACTIVE") {
      void refreshSession();
    }
  }, [live, user.vendorStatus]);
  return activation;
}

export function useStartActivation(onProblem: (message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<ActivationStarted>("/v1/vendor/activation/checkout", { method: "POST" }),
    onSuccess: (started) => {
      if (started.live) {
        void queryClient.invalidateQueries({ queryKey: ["vendor"] });
        return;
      }
      const url = started.redirectUrl ? safeCheckoutUrl(started.redirectUrl) : null;
      if (!url) {
        onProblem("We couldn't open the payment page. Try again.");
        return;
      }
      window.location.assign(url);
    },
  });
}

export function useSandboxActivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => apiRequest<VendorActivationView>(`/v1/vendor/activation/payments/${paymentId}/sandbox-pay`, { method: "POST" }),
    onSuccess: (view) => queryClient.setQueryData(ACTIVATION_KEY, view),
  });
}
