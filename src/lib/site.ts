import type { Metadata } from "next";

import { BRAND } from "./brand";

const FALLBACK_URL = process.env.NODE_ENV === "production" ? BRAND.siteUrl : "http://localhost:3000";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name}: ${BRAND.tagline}` };

export function publicPage({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${BRAND.name}`, description, url: path, siteName: BRAND.name, type: "website", locale: "en_GB", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: `${title} · ${BRAND.name}`, description, images: [SHARE_IMAGE.url] },
  };
}

export const PRIVATE_PAGE: Metadata = { robots: { index: false, follow: false } };

export const PRIVATE_PATHS = [
  "/admin",
  "/overview",
  "/inbound",
  "/inventory",
  "/orders",
  "/products",
  "/returns",
  "/claims",
  "/settings",
  "/storefront",
  "/verification",
  "/wallet",
  "/account",
  "/checkout",
  "/shopping",
  "/store/*/checkout",
  "/track/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/invite",
  "/staff-invite",
  "/mfa",
  "/v1/",
  "/assistant-knowledge.json",
] as const;
