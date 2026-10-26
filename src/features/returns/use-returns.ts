"use client";

import type { CreateVendorReturnInput, InstructVendorReturnInput, ReceiveVendorReturnInput, ReturnableOrderView, VendorReturnStatus, VendorReturnTrackingInput, VendorReturnView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

export type ReturnsSide = "vendor" | "warehouse";

const PATHS: Record<ReturnsSide, string> = { vendor: "/v1/vendor/returns", warehouse: "/v1/warehouse/returns" };
const key = (side: ReturnsSide) => ["returns", side] as const;

export function useReturns(side: ReturnsSide, status?: VendorReturnStatus) {
  return useQuery({ queryKey: [...key(side), "list", status ?? "ALL"], queryFn: () => apiRequest<VendorReturnView[]>(`${PATHS[side]}${status ? `?status=${status}` : ""}`) });
}

export function useReturn(side: ReturnsSide, returnId: string | null) {
  return useQuery({ queryKey: [...key(side), "one", returnId], queryFn: () => apiRequest<VendorReturnView>(`${PATHS[side]}/${returnId}`), enabled: Boolean(returnId) });
}

export function useReturnable(orderId: string) {
  return useQuery({
    queryKey: [...key("vendor"), "returnable", orderId],
    queryFn: () => apiRequest<ReturnableOrderView>(`/v1/vendor/returns/orders/${orderId}`),
    enabled: Boolean(orderId),
    retry: false,
  });
}

function useReturnMutation<Input>(side: ReturnsSide, request: (input: Input) => { path: string; method?: "POST" | "PUT"; body?: unknown }, announce: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const { path, method = "POST", body } = request(input);
      return apiRequest<VendorReturnView>(path, { method, body });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key(side) });
      void queryClient.invalidateQueries({ queryKey: ["vendor", "wallet"] });
      toast.success(announce);
    },
  });
}

export function useOpenReturn() {
  return useReturnMutation<CreateVendorReturnInput>("vendor", (input) => ({ path: "/v1/vendor/returns", body: input }), "Return opened");
}

export function useReturnTracking(returnId: string) {
  return useReturnMutation<VendorReturnTrackingInput>("vendor", (input) => ({ path: `/v1/vendor/returns/${returnId}/tracking`, method: "PUT", body: input }), "Tracking saved");
}

export function useCancelReturn(returnId: string) {
  return useReturnMutation<void>("vendor", () => ({ path: `/v1/vendor/returns/${returnId}/cancel` }), "Return cancelled and the fee is back in your wallet");
}

export function useInstructReturn(returnId: string) {
  return useReturnMutation<InstructVendorReturnInput>("vendor", (input) => ({ path: `/v1/vendor/returns/${returnId}/instructions`, body: input }), "Instructions sent to the warehouse");
}

export function useReceiveReturn(returnId: string) {
  return useReturnMutation<ReceiveVendorReturnInput>(
    "warehouse",
    (input) => ({ path: `/v1/warehouse/returns/${returnId}/receive`, body: input }),
    "Return received. The vendor has been asked what to do",
  );
}

export function useCompleteReturn(returnId: string) {
  return useReturnMutation<void>("warehouse", () => ({ path: `/v1/warehouse/returns/${returnId}/complete` }), "Return finished");
}

export function useReturnPhoto(side: ReturnsSide, returnId: string) {
  return useMutation({ mutationFn: (fileId: string) => apiRequest<{ url: string }>(`${PATHS[side]}/${returnId}/photos/${fileId}/url`, { method: "POST" }) });
}
