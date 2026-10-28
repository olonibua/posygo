"use client";

import type { IdentitySessionView, VerificationView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiRequest } from "@/lib/api/client";

import { VERIFICATION_KEY } from "./use-verification";

export function useVendorIdentity() {
  const queryClient = useQueryClient();
  const start = useMutation({ mutationFn: () => apiRequest<IdentitySessionView>("/v1/vendor/verification/identity/session", { method: "POST" }) });
  const refresh = useMutation({
    mutationFn: () => apiRequest<VerificationView>("/v1/vendor/verification/identity/refresh", { method: "POST" }),
    onSuccess: (next) => queryClient.setQueryData(VERIFICATION_KEY, next),
  });
  const failure = start.error ?? refresh.error;
  const error = failure ? (failure instanceof ApiError ? (Object.values(failure.fieldErrors)[0]?.[0] ?? failure.message) : "We couldn't reach the server. Try again.") : null;
  return { start, refresh, error };
}
