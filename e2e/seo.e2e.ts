import { type APIRequestContext, expect, test } from "@playwright/test";

const PRIVATE_SAMPLES = ["/login", "/overview", "/admin", "/account", "/verify-email"];

interface PageFacts {
  status: number;
  title: string;
  description: string;
  canonical: string;
  h1s: number;
  robots: string;
  jsonLd: unknown[];
}

function first(html: string, pattern: RegExp): string {
  return pattern.exec(html)?.[1] ?? "";
}

const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function readPage(request: APIRequestContext, path: string, userAgent = GOOGLEBOT): Promise<PageFacts> {
  const response = await request.get(path, { headers: { "User-Agent": userAgent } });
  const html = await response.text();
  const head = html.slice(0, html.indexOf("</head>"));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]!) as unknown);
  return {
    status: response.status(),
    title: first(head, /<title>([^<]*)<\/title>/),
    description: first(head, /<meta name="description" content="([^"]*)"/),
    canonical: first(head, /<link rel="canonical" href="([^"]*)"/),
    h1s: (html.match(/<h1[\s>]/g) ?? []).length,
    robots: first(head, /<meta name="robots" content="([^"]*)"/),
    jsonLd,
  };
}

async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname);
}

test.describe("what search engines and AI assistants see", () => {
  test("every page in the sitemap is ready to be found", async ({ request }) => {
    const paths = await sitemapPaths(request);
    expect(paths).toEqual(expect.arrayContaining(["/", "/pricing", "/how-it-works", "/fulfilment", "/guides", "/fulfilment/united-states"]));
    const titles = new Map<string, string>();
    for (const path of paths) {
      const page = await readPage(request, path);
      const where = `${path}: `;
      expect(page.status, `${where}status`).toBe(200);
      expect(page.title.length, `${where}title "${page.title}"`).toBeGreaterThan(10);
      expect(page.title.length, `${where}title "${page.title}"`).toBeLessThanOrEqual(80);
      expect(page.description.length, `${where}description`).toBeGreaterThanOrEqual(50);
      expect(page.description.length, `${where}description`).toBeLessThanOrEqual(200);
      expect(page.canonical, `${where}canonical`).not.toBe("");
      expect(new URL(page.canonical).pathname.replace(/\/$/, ""), `${where}canonical`).toBe(path.replace(/\/$/, ""));
      expect(page.h1s, `${where}one main heading`).toBe(1);
      expect(page.robots, `${where}robots`).not.toContain("noindex");
      expect(titles.get(page.title), `${where}title also used by`).toBeUndefined();
      titles.set(page.title, path);
    }
  });

  test("crawlers that don't run JavaScript get the title and description in the page head", async ({ request }) => {
    for (const userAgent of ["GPTBot/1.1 (+https://openai.com/gptbot)", "ClaudeBot/1.0", "PerplexityBot/1.0", "Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile"]) {
      const page = await readPage(request, "/pricing", userAgent);
      expect(page.title, userAgent).toContain("pricing");
      expect(page.description.length, userAgent).toBeGreaterThan(50);
    }
  });

  test("key pages describe themselves with structured data", async ({ request }) => {
    for (const [path, type] of [
      ["/", "Organization"],
      ["/pricing", "OfferCatalog"],
      ["/fulfilment/united-states", "FAQPage"],
      ["/guides/fulfilment-costs-explained", "Article"],
      ["/how-it-works", "HowTo"],
    ] as const) {
      const { jsonLd } = await readPage(request, path);
      expect(JSON.stringify(jsonLd), `${path} has ${type}`).toContain(`"@type":"${type}"`);
    }
  });

  test("US pages use the American spelling and real prices", async ({ request }) => {
    const html = await (await request.get("/fulfilment/united-states")).text();
    expect(html).toContain("Ecommerce fulfillment in the United States");
    expect(html).toMatch(/\$\d/);
  });

  test("private pages stay out of search results", async ({ request }) => {
    for (const path of PRIVATE_SAMPLES) {
      expect((await readPage(request, path)).robots, path).toContain("noindex");
    }
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("User-Agent: GPTBot");
    expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
  });

  test("AI assistants get a plain summary with prices and guides", async ({ request }) => {
    const index = await (await request.get("/llms.txt")).text();
    expect(index).toMatch(/^# Posygo/);
    expect(index).toContain("/fulfilment/united-kingdom");
    const full = await (await request.get("/llms-full.txt")).text();
    expect(full).toContain("Packing an order:");
    expect(full).toContain("## Fulfilment costs explained");
  });

  test("an unknown country page is a real not found", async ({ request }) => {
    expect((await request.get("/fulfilment/narnia")).status()).toBe(404);
  });
});
