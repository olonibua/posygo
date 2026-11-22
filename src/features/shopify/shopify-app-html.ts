import { BRAND } from "@/lib/brand";

export interface ShopifyAppPage {
  apiKey: string;
  apiUrl: string;
  nonce: string;
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character]!);
}

export function shopifyAppHtml({ apiKey, apiUrl, nonce }: ShopifyAppPage): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="shopify-api-key" content="${escape(apiKey)}">
<script nonce="${escape(nonce)}" src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
<title>${escape(BRAND.name)}</title>
<link rel="stylesheet" href="/shopify/app.css">
<script nonce="${escape(nonce)}" src="/shopify/app.js" defer></script>
</head>
<body data-api-url="${escape(apiUrl)}">
<main id="app" class="page">
<header class="masthead">
<img src="/brand/flower-mark.svg" alt="" width="32" height="32">
<div>
<h1>${escape(BRAND.name)}</h1>
<p class="soft">Your stock in hubs abroad. Orders go out from the hub, tracking comes back to Shopify.</p>
</div>
</header>
<section id="view" aria-live="polite"><p class="soft">Loading…</p></section>
</main>
</body>
</html>`;
}
