import { ApiError } from "@/lib/api/client";

export function errorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.";
}

export function fieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fieldErrors[field]?.[0] : undefined;
}

export function formError(error: unknown): string | null {
  if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
    return null;
  }
  return errorMessage(error);
}
