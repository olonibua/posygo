"use client";

import type { VerificationDraft, VerificationView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError, apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

export type FieldErrors = Record<string, string[]>;
export type DraftPatch = VerificationDraft;

export const VERIFICATION_KEY = ["vendor", "verification"] as const;

export function useVerification() {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const view = useQuery({ queryKey: VERIFICATION_KEY, queryFn: () => apiRequest<VerificationView>("/v1/vendor/verification") });

  function handleError(error: unknown) {
    if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
      setErrors(error.fieldErrors);
      setFormError("Some answers need attention.");
      return;
    }
    setFormError(error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.");
  }

  function succeed(next: VerificationView) {
    setErrors({});
    setFormError(null);
    queryClient.setQueryData(VERIFICATION_KEY, next);
  }

  const save = useMutation({ mutationFn: (patch: DraftPatch) => apiRequest<VerificationView>("/v1/vendor/verification", { method: "PUT", body: patch }), onSuccess: succeed, onError: handleError });

  const submit = useMutation({
    mutationFn: () => apiRequest<VerificationView>("/v1/vendor/verification/submit", { method: "POST" }),
    onSuccess: (next) => {
      succeed(next);
      toast.success("Sent for review", "We'll email you when it's checked.");
    },
    onError: handleError,
  });

  return { view, save, submit, errors, formError };
}

export function errorFor(errors: FieldErrors, path: string): string | undefined {
  return errors[path]?.[0];
}
