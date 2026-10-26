"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/client";

export type FieldErrors = Record<string, string[]>;

export function useFormErrors() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function capture(error: unknown) {
    if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
      setErrors(error.fieldErrors);
      setFormError("Some details need attention.");
      return;
    }
    setErrors({});
    setFormError(error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.");
  }

  function reset() {
    setErrors({});
    setFormError(null);
  }

  function errorFor(path: string): string | undefined {
    return errors[path]?.[0] ?? Object.entries(errors).find(([key]) => key.startsWith(`${path}.`))?.[1][0];
  }

  return { errors, formError, capture, reset, errorFor };
}

export function errorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.";
}
