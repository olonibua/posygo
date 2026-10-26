"use client";

import type { OrderDetailView, OrderStatus, OrderSummaryView, PackagingPresetView, PackInput, ScanResultView, StaffOrderActionInput } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const KEY = ["warehouse", "orders"] as const;

const ACTION_DONE: Partial<Record<StaffOrderActionInput["action"], string>> = {
  HAND_OFF: "Handed to the carrier",
  HOLD: "Order on hold",
  RELEASE: "Hold released",
  REPACK: "Back to packing",
  SELECT_RATE: "Shipping chosen",
};

export function useOrderQueue(status: OrderStatus | "OPEN", search: string) {
  const params = new URLSearchParams();
  if (status !== "OPEN") {
    params.set("status", status);
  }
  if (search) {
    params.set("q", search);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return useQuery({ queryKey: [...KEY, "queue", status, search], queryFn: () => apiRequest<OrderSummaryView[]>(`/v1/warehouse/orders${suffix}`), refetchInterval: 30_000 });
}

export function useCancellationQueue() {
  return useQuery({ queryKey: [...KEY, "cancellations"], queryFn: () => apiRequest<OrderSummaryView[]>("/v1/warehouse/orders/cancellation-requests") });
}

export function usePackaging(countryCode: string | null) {
  return useQuery({
    queryKey: ["warehouse", "packaging", countryCode],
    queryFn: () => apiRequest<PackagingPresetView[]>(`/v1/warehouse/packaging/${countryCode}`),
    enabled: Boolean(countryCode),
    staleTime: 300_000,
  });
}

export function useFulfilment(orderId: string) {
  const queryClient = useQueryClient();
  const key = [...KEY, orderId];
  const store = (next: OrderDetailView) => {
    queryClient.setQueryData(key, next);
    void queryClient.invalidateQueries({ queryKey: [...KEY, "queue"] });
    void queryClient.invalidateQueries({ queryKey: [...KEY, "cancellations"] });
  };
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });
  const order = useQuery({ queryKey: key, queryFn: () => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}`) });
  const scan = useMutation({ mutationFn: (code: string) => apiRequest<ScanResultView>(`/v1/warehouse/orders/${orderId}/scans`, { method: "POST", body: { code } }), onSuccess: () => void refresh() });
  const resetScans = useMutation({ mutationFn: () => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/scans`, { method: "DELETE" }), onSuccess: store });
  const pack = useMutation({
    mutationFn: (input: PackInput) => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/pack`, { method: "POST", body: input }),
    onSuccess: (next) => {
      store(next);
      toast.success("Parcel packed", next.reference);
    },
  });
  const act = useMutation({
    mutationFn: (input: StaffOrderActionInput) => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/actions`, { method: "POST", body: input }),
    onSuccess: (next, input) => {
      store(next);
      const done = ACTION_DONE[input.action];
      if (done) {
        toast.success(done, next.reference);
      }
    },
    onError: () => void refresh(),
  });
  const decide = useMutation({
    mutationFn: (input: { approve: boolean; note: string }) => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/cancellation-decision`, { method: "POST", body: input }),
    onSuccess: store,
  });
  const simulate = useMutation({
    mutationFn: (input: { status: "IN_TRANSIT" | "DELIVERED" | "FAILURE"; description: string }) =>
      apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/sandbox-tracking`, { method: "POST", body: input }),
    onSuccess: store,
  });
  const addPhotos = useMutation({
    mutationFn: (fileIds: string[]) => apiRequest<OrderDetailView>(`/v1/warehouse/orders/${orderId}/dispatch-photos`, { method: "POST", body: { fileIds } }),
    onSuccess: (next) => {
      store(next);
      toast.success("Dispatch photo added", next.reference);
    },
  });
  return { order, scan, resetScans, pack, act, decide, simulate, addPhotos };
}
