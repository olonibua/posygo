"use client";

import type { ResolveSupportCaseInput, SupportCaseDetailView, SupportCaseKind, SupportCaseStatus, SupportCaseView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const KEY = ["support-cases"] as const;

export function useSupportCases(status: SupportCaseStatus, kind?: SupportCaseKind) {
  return useQuery({
    queryKey: [...KEY, status, kind ?? "ALL"],
    queryFn: () => apiRequest<SupportCaseView[]>(`/v1/admin/support-cases?status=${status}${kind ? `&kind=${kind}` : ""}`),
    refetchInterval: 30_000,
  });
}

export function useSupportCase(caseId: string, enabled: boolean) {
  return useQuery({ queryKey: [...KEY, "detail", caseId], queryFn: () => apiRequest<SupportCaseDetailView>(`/v1/admin/support-cases/${caseId}`), enabled });
}

export function useResolveSupportCase(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResolveSupportCaseInput) => apiRequest<SupportCaseDetailView>(`/v1/admin/support-cases/${caseId}/resolve`, { method: "POST", body: input }),
    onSuccess: (resolved) => {
      toast.success(`${resolved.reference} resolved`, "Everyone who reported it has been told.");
      void queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}
