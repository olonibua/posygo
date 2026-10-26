import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api/client";

export function applyServerErrors<Values extends FieldValues>(error: unknown, setError: UseFormSetError<Values>, fields: readonly Path<Values>[]): string | null {
  if (!(error instanceof ApiError)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  let placed = false;
  for (const field of fields) {
    const message = error.fieldErrors[field]?.[0];
    if (message) {
      setError(field, { message });
      placed = true;
    }
  }
  return placed ? null : error.message;
}
