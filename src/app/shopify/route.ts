import { shopifyAppHtml } from "@/features/shopify/shopify-app-html";

export const dynamic = "force-dynamic";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export function GET(request: Request): Response {
  const html = shopifyAppHtml({ apiKey: process.env.SHOPIFY_API_KEY ?? "", apiUrl: API_URL, nonce: request.headers.get("x-nonce") ?? "" });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
