import type { MetadataRoute } from "next";

import { sitePages } from "@/features/marketing/site-pages";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await sitePages()).map((page) => ({ url: absoluteUrl(page.path), priority: page.priority, ...(page.updated ? { lastModified: page.updated } : {}) }));
}
