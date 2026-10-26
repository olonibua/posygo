"use client";

import type { AdjustmentStatus, AdjustmentView, LedgerEntryView, ReconciliationReportView, RequestAdjustmentInput, WalletStatus, WalletView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const FINANCE_KEY = ["admin", "finance"] as const;

export function useFinanceWallets(filters: { countryCode?: string; status?: WalletStatus }) {
  const query = new URLSearchParams(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return useQuery({ queryKey: [...FINANCE_KEY, "wallets", filters], queryFn: () => apiRequest<WalletView[]>(`/v1/admin/finance/wallets${suffix}`) });
}

export function useFinanceWallet(walletId: string) {
  return useQuery({ queryKey: [...FINANCE_KEY, "wallet", walletId], queryFn: () => apiRequest<{ wallet: WalletView; ledger: LedgerEntryView[] }>(`/v1/admin/finance/wallets/${walletId}`) });
}

export function useAdjustments(status?: AdjustmentStatus) {
  return useQuery({ queryKey: [...FINANCE_KEY, "adjustments", status ?? "ALL"], queryFn: () => apiRequest<AdjustmentView[]>(`/v1/admin/finance/adjustments${status ? `?status=${status}` : ""}`) });
}

function useFinanceMutation<Input, Output>(mutationFn: (input: Input) => Promise<Output>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => void queryClient.invalidateQueries({ queryKey: FINANCE_KEY }) });
}

export function useRequestAdjustment(walletId: string) {
  return useFinanceMutation((input: RequestAdjustmentInput) => apiRequest<AdjustmentView>(`/v1/admin/finance/wallets/${walletId}/adjustments`, { method: "POST", body: input }));
}

export function useDecideAdjustment() {
  return useFinanceMutation((input: { id: string; approve: boolean; note: string }) =>
    apiRequest<AdjustmentView>(`/v1/admin/finance/adjustments/${input.id}/decision`, { method: "POST", body: { approve: input.approve, note: input.note } }),
  );
}

export function useSetFrozen(walletId: string) {
  return useFinanceMutation((input: { frozen: boolean; reason: string }) => apiRequest<WalletView>(`/v1/admin/finance/wallets/${walletId}/status`, { method: "POST", body: input }));
}

export function useReconciliation() {
  const reports = useQuery({ queryKey: [...FINANCE_KEY, "reconciliation"], queryFn: () => apiRequest<ReconciliationReportView[]>("/v1/admin/finance/reconciliation") });
  const run = useFinanceMutation(() => apiRequest<ReconciliationReportView>("/v1/admin/finance/reconciliation", { method: "POST" }));
  return { reports, run };
}
