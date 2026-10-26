"use client";

import type { ClaimStatus, ClaimView, CustodyAlertView, HubSignalView, TransferStatus, TransferView, TrustView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const KEY = ["custody"] as const;

export type ClaimAudience = "admin" | "vendor" | "partner";
export type HubRoute = "partner" | "warehouse";

const CLAIM_PATHS: Record<ClaimAudience, string> = { admin: "/v1/admin/claims", vendor: "/v1/vendor/claims", partner: "/v1/partner/claims" };

export function useClaims(audience: ClaimAudience, status?: ClaimStatus) {
  return useQuery({ queryKey: [...KEY, "claims", audience, status ?? "ALL"], queryFn: () => apiRequest<ClaimView[]>(`${CLAIM_PATHS[audience]}${status ? `?status=${status}` : ""}`) });
}

export function useClaim(claimId: string | null) {
  return useQuery({ queryKey: [...KEY, "claims", "admin", "one", claimId], queryFn: () => apiRequest<ClaimView>(`/v1/admin/claims/${claimId}`), enabled: Boolean(claimId) });
}

export function useCustodyAlerts(status: "OPEN" | "RESOLVED") {
  return useQuery({ queryKey: [...KEY, "alerts", status], queryFn: () => apiRequest<CustodyAlertView[]>(`/v1/admin/custody-alerts?status=${status}`) });
}

export function useAdminTransfers(status?: TransferStatus) {
  return useQuery({ queryKey: [...KEY, "transfers", "admin", status ?? "ALL"], queryFn: () => apiRequest<TransferView[]>(`/v1/admin/transfers${status ? `?status=${status}` : ""}`) });
}

export function useHubTransfers(route: HubRoute) {
  return useQuery({ queryKey: [...KEY, "transfers", route], queryFn: () => apiRequest<TransferView[]>(`/v1/${route}/transfers`) });
}

export function useTrust(partnerId?: string) {
  return useQuery({ queryKey: [...KEY, "trust", partnerId ?? "mine"], queryFn: () => apiRequest<TrustView>(partnerId ? `/v1/admin/partners/${partnerId}/trust` : "/v1/partner/trust") });
}

export function useHubSignals() {
  return useQuery({ queryKey: [...KEY, "hubs"], queryFn: () => apiRequest<HubSignalView[]>("/v1/vendor/hubs") });
}

export function useCustodyMutation<Input, Output>(request: (input: Input) => { path: string; body?: unknown }, announce: string | ((input: Input) => string)) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const { path, body } = request(input);
      return apiRequest<Output>(path, { method: "POST", body });
    },
    onSuccess: (_output, input) => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(typeof announce === "function" ? announce(input) : announce);
    },
  });
}
