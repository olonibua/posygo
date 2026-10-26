"use client";

import type { FeeSchedule, FeeScheduleView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export function useFeeSchedules(countryCode: string) {
  const queryClient = useQueryClient();
  const key = ["admin", "fee-schedules", countryCode];
  const history = useQuery({ queryKey: key, queryFn: () => apiRequest<FeeScheduleView[]>(`/v1/admin/fee-schedules/${countryCode}`), enabled: Boolean(countryCode) });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: key });
  const propose = useMutation({
    mutationFn: (input: { schedule: FeeSchedule; note: string }) => apiRequest<FeeScheduleView>(`/v1/admin/fee-schedules/${countryCode}`, { method: "POST", body: input }),
    onSuccess: refresh,
  });
  const decide = useMutation({
    mutationFn: (input: { id: string; approve: boolean; note: string }) =>
      apiRequest<FeeScheduleView>(`/v1/admin/fee-schedules/decisions/${input.id}`, { method: "POST", body: { approve: input.approve, note: input.note } }),
    onSuccess: refresh,
  });
  return { history, propose, decide };
}
