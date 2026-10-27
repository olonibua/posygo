const API_URL = (process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;

export type PublicResult<T> = { kind: "found"; data: T } | { kind: "missing" } | { kind: "unavailable" };

export async function loadPublic<T>(path: string): Promise<PublicResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(3000) });
    if (response.status === 404) {
      return { kind: "missing" };
    }
    return response.ok ? { kind: "found", data: (await response.json()) as T } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

export async function fetchPublic<T>(path: string): Promise<T | null> {
  const result = await loadPublic<T>(path);
  return result.kind === "found" ? result.data : null;
}
