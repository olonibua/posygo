"use client";

import type { AccountRequestInput, MySupportRequestView, SupportReportResult } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const KEY = ["my-support-requests"] as const;

export function useMyRequests() {
  return useQuery({ queryKey: KEY, queryFn: () => apiRequest<MySupportRequestView[]>("/v1/support-cases") });
}

export function useAccountRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountRequestInput) => apiRequest<SupportReportResult>("/v1/support-cases/requests", { method: "POST", body: input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
