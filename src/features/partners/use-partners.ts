"use client";

import type { MysteryOrderView, PartnerDetailView, PartnerPayoutView, PartnerStatementView, PartnerStatus, PartnerStockSummaryView, PartnerSummaryView, ScorecardView, StatementRange, StockCountView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const ADMIN_KEY = ["admin", "partners"] as const;
const PORTAL_KEY = ["partner"] as const;

type Method = "POST" | "PUT" | "DELETE";

function rangeQuery(range: StatementRange): string {
  const query = new URLSearchParams(Object.entries(range).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return query.size > 0 ? `?${query.toString()}` : "";
}

type Announce<Input> = string | ((input: Input) => string);

function usePartnerMutation<Input, Output = PartnerDetailView>(key: readonly string[], request: (input: Input) => { path: string; method?: Method; body?: unknown }, announce?: Announce<Input>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const { path, method = "POST", body } = request(input);
      return apiRequest<Output>(path, { method, body });
    },
    onSuccess: (_output, input) => {
      void queryClient.invalidateQueries({ queryKey: key });
      if (announce) {
        toast.success(typeof announce === "function" ? announce(input) : announce);
      }
    },
  });
}

export function usePartnerList(status?: PartnerStatus) {
  return useQuery({ queryKey: [...ADMIN_KEY, "list", status ?? "ALL"], queryFn: () => apiRequest<PartnerSummaryView[]>(`/v1/admin/partners${status ? `?status=${status}` : ""}`) });
}

export function usePartnerCase(partnerId: string) {
  return useQuery({ queryKey: [...ADMIN_KEY, partnerId], queryFn: () => apiRequest<PartnerDetailView>(`/v1/admin/partners/${partnerId}`) });
}

export function useAdminPartnerMutation<Input, Output = PartnerDetailView>(request: (input: Input) => { path: string; method?: Method; body?: unknown }, announce?: Announce<Input>) {
  return usePartnerMutation<Input, Output>(ADMIN_KEY, request, announce);
}

export function useAdminStatement(partnerId: string, range: StatementRange, enabled: boolean) {
  return useQuery({
    queryKey: [...ADMIN_KEY, partnerId, "statement", range],
    queryFn: () => apiRequest<PartnerStatementView>(`/v1/admin/partners/${partnerId}/statement${rangeQuery(range)}`),
    enabled,
  });
}

export function usePartnerPayouts(status?: PartnerPayoutView["status"]) {
  return useQuery({ queryKey: [...ADMIN_KEY, "payouts", status ?? "ALL"], queryFn: () => apiRequest<PartnerPayoutView[]>(`/v1/admin/partner-payouts${status ? `?status=${status}` : ""}`) });
}

export function usePartnerStockSummary() {
  return useQuery({ queryKey: [...PORTAL_KEY, "stock"], queryFn: () => apiRequest<PartnerStockSummaryView>("/v1/partner/stock"), refetchInterval: 60_000 });
}

export function usePartnerOverview() {
  return useQuery({ queryKey: [...PORTAL_KEY, "overview"], queryFn: () => apiRequest<PartnerDetailView>("/v1/partner") });
}

export function usePortalMutation<Input, Output = PartnerDetailView>(request: (input: Input) => { path: string; method?: Method; body?: unknown }, announce?: Announce<Input>) {
  return usePartnerMutation<Input, Output>(PORTAL_KEY, request, announce);
}

export function usePartnerStatement(range: StatementRange) {
  return useQuery({ queryKey: [...PORTAL_KEY, "statement", range], queryFn: () => apiRequest<PartnerStatementView>(`/v1/partner/statement${rangeQuery(range)}`) });
}

export function usePartnerScorecard(partnerId?: string) {
  const path = partnerId ? `/v1/admin/partners/${partnerId}/scorecard` : "/v1/partner/scorecard";
  return useQuery({ queryKey: partnerId ? [...ADMIN_KEY, partnerId, "scorecard"] : [...PORTAL_KEY, "scorecard"], queryFn: () => apiRequest<ScorecardView>(path) });
}

export function useAdminStockCounts(status?: StockCountView["status"]) {
  return useQuery({ queryKey: [...ADMIN_KEY, "stock-counts", status ?? "ALL"], queryFn: () => apiRequest<StockCountView[]>(`/v1/admin/stock-counts${status ? `?status=${status}` : ""}`) });
}

export function useAdminStockCount(countId: string | null) {
  return useQuery({ queryKey: [...ADMIN_KEY, "stock-counts", "detail", countId], queryFn: () => apiRequest<StockCountView>(`/v1/admin/stock-counts/${countId}`), enabled: Boolean(countId) });
}

export function useHubStockCounts() {
  return useQuery({ queryKey: [...PORTAL_KEY, "stock-counts"], queryFn: () => apiRequest<StockCountView[]>("/v1/warehouse/stock-counts") });
}

export function useHubStockCountSubmit() {
  return usePartnerMutation<{ id: string; videoFileId: string; lines: Array<{ lineId: string; countedQuantity: number }> }, StockCountView>(PORTAL_KEY, ({ id, ...body }) => ({
    path: `/v1/warehouse/stock-counts/${id}/submit`,
    body,
  }));
}

export function useMysteryOrders() {
  return useQuery({ queryKey: [...ADMIN_KEY, "mystery-orders"], queryFn: () => apiRequest<MysteryOrderView[]>("/v1/admin/mystery-orders") });
}
