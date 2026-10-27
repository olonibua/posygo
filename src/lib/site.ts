import type { Metadata } from "next";

import { BRAND } from "./brand";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

export function publicPage({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${BRAND.name}`, description, url: path, siteName: BRAND.name, type: "website", locale: "en_GB" },
    twitter: { card: "summary_large_image", title: `${title} · ${BRAND.name}`, description },
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
