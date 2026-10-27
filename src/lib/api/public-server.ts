const API_URL = (process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;

export type PublicResult<T> = { kind: "found"; data: T } | { kind: "missing" } | { kind: "unavailable" };

export interface PublicFetchOptions {
  live?: boolean;
}

function caching(options: PublicFetchOptions): RequestInit {
  return options.live ? { cache: "no-store" } : { next: { revalidate: REVALIDATE_SECONDS } };
}

export async function loadPublic<T>(path: string, options: PublicFetchOptions = {}): Promise<PublicResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, { ...caching(options), signal: AbortSignal.timeout(3000) });
    if (response.status === 404) {
      return { kind: "missing" };
    }
    return response.ok ? { kind: "found", data: (await response.json()) as T } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

export async function fetchPublic<T>(path: string, options: PublicFetchOptions = {}): Promise<T | null> {
  const result = await loadPublic<T>(path, options);
  return result.kind === "found" ? result.data : null;
}
