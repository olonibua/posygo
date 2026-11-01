"use client";

import type { ReminderKey, ReminderTemplateInput, ReminderView, UpdateReminderInput } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const KEY = ["admin", "reminders"];

export function useReminders() {
  return useQuery({ queryKey: KEY, queryFn: () => apiRequest<ReminderView[]>("/v1/admin/reminders") });
}

export function useSaveReminder(key: ReminderKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateReminderInput) => apiRequest<ReminderView>(`/v1/admin/reminders/${key}`, { method: "PATCH", body: input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useResetReminder(key: ReminderKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<ReminderView>(`/v1/admin/reminders/${key}/reset`, { method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useTestReminder(key: ReminderKey) {
  return useMutation({ mutationFn: (input: ReminderTemplateInput) => apiRequest<{ to: string }>(`/v1/admin/reminders/${key}/test`, { method: "POST", body: input }) });
}
