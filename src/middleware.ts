import { type NextRequest, NextResponse } from "next/server";

const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").origin;
const STORAGE_ORIGIN = process.env.NEXT_PUBLIC_STORAGE_ORIGIN ? new URL(process.env.NEXT_PUBLIC_STORAGE_ORIGIN).origin : "";
const DEVELOPMENT = process.env.NODE_ENV !== "production";

export function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${DEVELOPMENT ? " 'unsafe-eval'" : ""}`,
    `style-src 'self'${DEVELOPMENT ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`}`,
    `img-src 'self' data: blob: ${API_ORIGIN}${STORAGE_ORIGIN ? ` ${STORAGE_ORIGIN}` : ""}`,
    "font-src 'self'",
    `connect-src 'self' ${API_ORIGIN}${STORAGE_ORIGIN ? ` ${STORAGE_ORIGIN}` : ""}${DEVELOPMENT ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(DEVELOPMENT ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = { matcher: [{ source: "/((?!_next/static|_next/image|brand/|favicon.ico).*)", missing: [{ type: "header", key: "next-router-prefetch" }] }] };
