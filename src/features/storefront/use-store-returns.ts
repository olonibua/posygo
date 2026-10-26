"use client";

import type { DiscountCodeInput, DiscountCodeView, ReturnDecisionInput, StoreReturnCaseView, StorefrontReturnStatus } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

export type ReturnsAudience = "vendor" | "admin";

const RETURN_PATHS: Record<ReturnsAudience, string> = { vendor: "/v1/vendor/storefront/returns", admin: "/v1/admin/storefront-returns" };
const DISCOUNTS_KEY = ["vendor", "storefront", "discounts"] as const;
const returnsKey = (audience: ReturnsAudience) => ["storefront-returns", audience] as const;

export function useStoreReturns(audience: ReturnsAudience, status?: StorefrontReturnStatus) {
  return useQuery({ queryKey: [...returnsKey(audience), status ?? "ALL"], queryFn: () => apiRequest<StoreReturnCaseView[]>(`${RETURN_PATHS[audience]}${status ? `?status=${status}` : ""}`) });
}

function useReturnMutation<Input>(audience: ReturnsAudience, path: (input: Input) => { path: string; body?: unknown }, announce: (result: StoreReturnCaseView) => string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const request = path(input);
      return apiRequest<StoreReturnCaseView>(request.path, { method: "POST", body: request.body });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: returnsKey(audience) });
      void queryClient.invalidateQueries({ queryKey: ["vendor", "storefront"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "storefront-orders"] });
      toast.success(announce(result));
    },
  });
}

export function useDecideReturn(audience: ReturnsAudience, returnId: string) {
  return useReturnMutation<ReturnDecisionInput>(
    audience,
    (input) => ({ path: `${RETURN_PATHS[audience]}/${returnId}/decision`, body: input }),
    (result) =>
      result.status === "REJECTED"
        ? "Return turned down. The buyer has been told why."
        : result.status === "REFUNDED"
          ? "Return accepted and refunded"
          : "Return accepted. The refund will be retried.",
  );
}

export function useRetryReturnRefund(audience: ReturnsAudience, returnId: string) {
  return useReturnMutation<void>(
    audience,
    () => ({ path: `${RETURN_PATHS[audience]}/${returnId}/refund-retry` }),
    () => "Refund sent",
  );
}

export function useDiscountCodes() {
  return useQuery({ queryKey: DISCOUNTS_KEY, queryFn: () => apiRequest<DiscountCodeView[]>("/v1/vendor/storefront/discounts") });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscountCodeInput) => apiRequest<DiscountCodeView>("/v1/vendor/storefront/discounts", { method: "POST", body: input }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: DISCOUNTS_KEY });
      toast.success(`${created.code} is ready to share`);
    },
  });
}

export function useToggleDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiRequest<DiscountCodeView>(`/v1/vendor/storefront/discounts/${id}`, { method: "PUT", body: { active } }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: DISCOUNTS_KEY });
      toast.success(updated.active ? `${updated.code} switched on` : `${updated.code} switched off`);
    },
  });
}
