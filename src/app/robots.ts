import type { MetadataRoute } from "next";

import { absoluteUrl, PRIVATE_PATHS } from "@/lib/site";

const ANSWER_ENGINES = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  const disallow = [...PRIVATE_PATHS];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: ANSWER_ENGINES, allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
