"use client";

import type { AuthenticatedResult, LoginInput } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export function useTestShortcuts(): boolean {
  const query = useQuery({
    queryKey: ["auth", "test-shortcuts"],
    queryFn: () => apiRequest<{ enabled: boolean }>("/v1/auth/test-shortcuts", { authenticated: false }),
    staleTime: Infinity,
    retry: false,
  });
  return query.data?.enabled ?? false;
}

export function useSkipEmailCheck() {
  return useMutation({ mutationFn: (input: LoginInput) => apiRequest<AuthenticatedResult>("/v1/auth/test-shortcuts/verify-email", { method: "POST", body: input, authenticated: false }) });
}

export function useSkipMfaSetup() {
  return useMutation({ mutationFn: () => apiRequest<AuthenticatedResult>("/v1/auth/mfa/skip", { method: "POST" }) });
}
