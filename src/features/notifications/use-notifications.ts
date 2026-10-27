"use client";

import type { NotificationFeedView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const KEY = ["notifications"] as const;
const POLL_MS = 30_000;

export function useNotifications() {
  return useQuery({ queryKey: KEY, queryFn: () => apiRequest<NotificationFeedView>("/v1/notifications"), refetchInterval: POLL_MS, refetchOnWindowFocus: true });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | "all") => apiRequest<NotificationFeedView>(id === "all" ? "/v1/notifications/read-all" : `/v1/notifications/${id}/read`, { method: "POST" }),
    onSuccess: (feed) => queryClient.setQueryData(KEY, feed),
  });
}
