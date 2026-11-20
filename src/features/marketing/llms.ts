import { STORAGE_TIERS } from "@/shared";

import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { BRAND } from "@/lib/brand";
import { FEATURES } from "@/lib/features";
import { formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

import { AFRICAN_SELLER_COUNTRIES, africanBrandsFaq } from "./african-brands-copy";
import { VENDOR_FAQ } from "./faq";
import { GUIDES } from "./guides";
import type { Market } from "./market-data";
import { marketFaq } from "./market-copy";
import type { SitePage } from "./site-pages";

const ABOUT = [
  `${BRAND.name} is ecommerce fulfilment for online sellers who want faster delivery. Sellers store their stock in the country they sell to, closer to their customers. ${BRAND.name} counts and photographs every arrival, picks, packs and photographs every order, and delivers it with tracking, so customers get their orders in days, not weeks.`,
  `If stock is lost or damaged while ${BRAND.name} holds it, approved claims are credited to the seller's wallet, and sellers can see every box and every order at any time.`,
  `${BRAND.name} is built for brands that sell abroad, including African brands in ${AFRICAN_SELLER_COUNTRIES} and across Africa whose customers live in other countries. They send their stock in bulk by air or sea, ${BRAND.name} stores it in their customers' country, and each order is packed and delivered locally in days, so customers pay nothing at the door.`,
  "Pricing is pay-as-you-go with no subscription: a stocking fee and monthly storage per box, a fee per packed order, and shipping at carrier cost plus a small markup.",
  `Sellers on Shopify or WooCommerce connect their store so every paid order reaches the hub automatically: see ${absoluteUrl("/integrations/shopify")} and ${absoluteUrl("/integrations/woocommerce")}.`,
  ...(FEATURES.marketplace ? [`${BRAND.name} also offers a marketplace of independent sellers and ready-made storefronts for sellers.`] : []),
];

const pageLine = (page: SitePage) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.summary}`;

export function llmsIndex(pages: readonly SitePage[]): string {
  const sections = [
    `# ${BRAND.name}`,
    `> ${BRAND.description}`,
    ABOUT.join("\n\n"),
    "## Main pages",
    pages
      .filter((page) => !page.path.startsWith("/guides/") && !page.path.startsWith("/store/"))
      .map(pageLine)
      .join("\n"),
    "## Guides",
    pages
      .filter((page) => page.path.startsWith("/guides/"))
      .map(pageLine)
      .join("\n"),
    "## Optional",
    `- [Full text for AI assistants](${absoluteUrl("/llms-full.txt")}): every guide, FAQ and current price list in one file.`,
  ];
  return `${sections.join("\n\n")}\n`;
}

function priceList(market: Market): string {
  const schedule = market.prices?.schedule;
  if (!schedule) {
    return "";
  }
  const money = (minor: number) => formatMoney(minor, market.country.currency, market.country.locale);
  const storage = STORAGE_TIERS.map((tier) => {
    const monthly = schedule.monthlyStorage[tier];
    return `- ${STORAGE_TIER_LABELS[tier].label} box storage: ${monthly === null ? "by quote" : `${money(monthly)} a month`}`;
  });
  return [
    `- Packing an order: ${money(schedule.fulfilment.baseMinor)} plus ${money(schedule.fulfilment.perAdditionalUnitMinor)} per extra unit, capped at ${money(schedule.fulfilment.maxMinor)}`,
    ...storage,
    `- Handling a return: ${money(schedule.returnsHandlingMinor)}`,
    `- Shipping: carrier price plus ${schedule.shippingMarkupBps / 100}%`,
  ].join("\n");
}

const faqBlock = (items: ReadonlyArray<{ question: string; answer: string }>) => items.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n");

export function llmsFull(markets: readonly Market[]): string {
  const sections = [
    `# ${BRAND.name}`,
    `> ${BRAND.description}`,
    ABOUT.join("\n\n"),
    ...markets.flatMap((market) =>
      [
        `## ${market.country.name} (${market.country.currency})`,
        priceList(market),
        faqBlock(marketFaq(market)),
        `### Selling from Africa to ${market.country.name}`,
        faqBlock(africanBrandsFaq(market)),
      ].filter(Boolean),
    ),
    "## Questions sellers ask",
    faqBlock(VENDOR_FAQ),
    ...GUIDES.flatMap((guide) => [
      `## ${guide.title}`,
      `Source: ${absoluteUrl(`/guides/${guide.slug}`)}`,
      ...guide.sections.map((section) => `### ${section.heading}\n\n${section.paragraphs.join("\n\n")}`),
    ]),
  ];
  return `${sections.join("\n\n")}\n`;
}
