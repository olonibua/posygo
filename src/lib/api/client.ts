import type { ApiErrorBody, AuthenticatedResult } from "@/shared";

import { rememberSignedIn } from "@/lib/auth/session-hint";
import { BRAND } from "@/lib/brand";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export function apiAssetUrl(path: string): string {
  return `${API_URL}${path}`;
}

const SESSION_STARTERS = ["/v1/staff-invitations/accept", "/v1/invitations/accept"];

export function carriesSessionCookie(path: string): boolean {
  return path.startsWith("/v1/auth/") || path.startsWith("/v1/buyer/") || SESSION_STARTERS.includes(path);
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
    readonly correlationId: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const NETWORK_ERROR = "network_error";

export interface ApiFailure {
  method: string;
  endpoint: string;
  error: ApiError;
}

type FailureListener = (failure: ApiFailure) => void;
const failureListeners = new Set<FailureListener>();

export function onApiFailure(listener: FailureListener): () => void {
  failureListeners.add(listener);
  return () => failureListeners.delete(listener);
}

function announce(method: string, path: string, error: ApiError): void {
  if (path === "/v1/auth/refresh") {
    return;
  }
  const failure = { method, endpoint: path.split("?")[0]!, error };
  failureListeners.forEach((listener) => listener(failure));
}

type SessionListener = (result: AuthenticatedResult | null) => void;

let accessToken: string | null = null;
let refreshInFlight: Promise<AuthenticatedResult | null> | null = null;
const listeners = new Set<SessionListener>();

export function onSessionChange(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSession(result: AuthenticatedResult | null): void {
  accessToken = result?.accessToken ?? null;
  rememberSignedIn(result !== null);
  listeners.forEach((listener) => listener(result));
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  authenticated?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true } = options;
  try {
    return await send<T>(path, options, authenticated);
  } catch (error) {
    if (!authenticated || !(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
    const refreshed = await refreshSession();
    if (!refreshed) {
      throw error;
    }
    return send<T>(path, options, true);
  }
}

export function refreshSession(): Promise<AuthenticatedResult | null> {
  refreshInFlight ??= attemptRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function attemptRefresh(retried = false): Promise<AuthenticatedResult | null> {
  try {
    const result = await send<AuthenticatedResult>("/v1/auth/refresh", { method: "POST" }, false);
    setSession(result);
    return result;
  } catch (error) {
    if (error instanceof ApiError && error.code === "refresh_superseded" && !retried) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return attemptRefresh(true);
    }
    setSession(null);
    return null;
  }
}

async function send<T>(path: string, options: RequestOptions, withToken: boolean): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (withToken && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const method = options.method ?? "GET";
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: carriesSessionCookie(path) ? "include" : "omit",
    cache: "no-store",
  }).catch(() => {
    const error = new ApiError(0, NETWORK_ERROR, `We couldn't reach ${BRAND.name}. Check your connection and try again.`);
    announce(method, path, error);
    throw error;
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (response.ok && response.headers.get("content-type")?.startsWith("text/csv")) {
    return (await response.text()) as T;
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = (payload ?? {}) as Partial<ApiErrorBody>;
    const error = new ApiError(response.status, body.code ?? "internal_error", body.message ?? "Something went wrong.", body.fieldErrors, body.correlationId ?? null);
    announce(method, path, error);
    throw error;
  }
  return payload as T;
}
