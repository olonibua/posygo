"use client";

import type { InboundAction, InboundDetailView, ReceiveInboundInput } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export type ReasonAction = Extract<InboundAction, "HOLD" | "REJECT" | "REQUEST_RETURN">;
export type DirectAction = Extract<InboundAction, "CHECK_IN" | "RELEASE">;

export function useInboundCase(inboundId: string) {
  const queryClient = useQueryClient();
  const key = ["warehouse", "inbound", inboundId];
  const path = `/v1/warehouse/inbound/${inboundId}`;
  const store = (next: InboundDetailView) => {
    queryClient.setQueryData(key, next);
    void queryClient.invalidateQueries({ queryKey: ["warehouse", "inbound"], exact: false, refetchType: "none" });
  };
  const detail = useQuery({ queryKey: key, queryFn: () => apiRequest<InboundDetailView>(path) });
  const act = useMutation({
    mutationFn: (input: { action: DirectAction | ReasonAction; reason?: string; chargeMinor?: number }) => apiRequest<InboundDetailView>(`${path}/actions`, { method: "POST", body: input }),
    onSuccess: store,
  });
  const receive = useMutation({ mutationFn: (input: ReceiveInboundInput) => apiRequest<InboundDetailView>(`${path}/receive`, { method: "POST", body: input }), onSuccess: store });
  const message = useMutation({ mutationFn: (body: string) => apiRequest<InboundDetailView>(`${path}/messages`, { method: "POST", body: { body } }), onSuccess: store });
  const openPhoto = useMutation({
    mutationFn: (fileId: string) => apiRequest<{ url: string }>(`${path}/photos/${fileId}/url`, { method: "POST" }),
    onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
  });
  return { detail, act, receive, message, openPhoto };
}
