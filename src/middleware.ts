import { type NextRequest, NextResponse } from "next/server";

const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").origin;
const API_SOCKET_ORIGIN = API_ORIGIN.replace(/^http/, "ws");
const STORAGE_ORIGIN = process.env.NEXT_PUBLIC_STORAGE_ORIGIN ? new URL(process.env.NEXT_PUBLIC_STORAGE_ORIGIN).origin : "";
const DEVELOPMENT = process.env.NODE_ENV !== "production";
const META_ORIGINS = "https://connect.facebook.net https://www.facebook.com";
const SHOPIFY_APP_PATH = "/shopify";
const SHOPIFY_ADMIN = "https://admin.shopify.com";
const SHOPIFY_CDN = "https://cdn.shopify.com";
const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export interface ShopifyFrame {
  shop: string | null;
}

export function shopifyFrameFor(request: NextRequest): ShopifyFrame | undefined {
  if (request.nextUrl.pathname !== SHOPIFY_APP_PATH) {
    return undefined;
  }
  const shop = request.nextUrl.searchParams.get("shop");
  return { shop: shop && SHOP_DOMAIN.test(shop) ? shop : null };
}

export function buildContentSecurityPolicy(nonce: string, shopify?: ShopifyFrame): string {
  const shopifyCdn = shopify ? ` ${SHOPIFY_CDN}` : "";
  const frameAncestors = shopify ? [shopify.shop ? `https://${shopify.shop}` : "", SHOPIFY_ADMIN].filter(Boolean).join(" ") : "'none'";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${shopifyCdn}${DEVELOPMENT ? " 'unsafe-eval'" : ""}`,
    `style-src 'self'${DEVELOPMENT ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`}${shopifyCdn}`,
    `img-src 'self' data: blob: ${API_ORIGIN}${STORAGE_ORIGIN ? ` ${STORAGE_ORIGIN}` : ""} https://www.facebook.com${shopifyCdn}`,
    "font-src 'self'",
    `connect-src 'self' ${API_ORIGIN} ${API_SOCKET_ORIGIN}${STORAGE_ORIGIN ? ` ${STORAGE_ORIGIN}` : ""} ${META_ORIGINS}${shopifyCdn}${DEVELOPMENT ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(DEVELOPMENT ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const shopify = shopifyFrameFor(request);
  const policy = buildContentSecurityPolicy(nonce, shopify);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  if (!shopify) {
    response.headers.set("X-Frame-Options", "DENY");
  }
  return response;
}

export const config = { matcher: [{ source: "/((?!_next/static|_next/image|brand/|email/|favicon.ico).*)", missing: [{ type: "header", key: "next-router-prefetch" }] }] };
