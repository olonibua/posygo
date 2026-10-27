import { STORAGE_TIERS } from "@/shared";

import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { BRAND } from "@/lib/brand";
import { formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

import { VENDOR_FAQ } from "./faq";
import { GUIDES } from "./guides";
import type { Market } from "./market-data";
import { marketFaq } from "./market-copy";
import { PARTNER_FAQ } from "./partner-landing";
import type { SitePage } from "./site-pages";

const ABOUT = [
  `${BRAND.name} is a fulfilment network for online sellers. Sellers store stock at vetted local hubs in the countries they sell to. Each hub counts and photographs every arrival, packs and photographs every order, and ships it with a local carrier and tracking.`,
  "Hubs are run by local partners who pass identity, address, referee and premises checks. Stock is insured while at a hub, with the cover held by Posygo rather than the partner.",
  "Pricing is pay-as-you-go with no subscription: a stocking fee and monthly storage per box, a fee per packed order, and shipping at carrier cost plus a small markup.",
  "Posygo also offers a marketplace of independent sellers, storefronts for sellers, and a personal shopping service that buys from shops in a country it serves and ships to the buyer.",
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
    ...markets.flatMap((market) => [`## ${market.country.name} (${market.country.currency})`, priceList(market), faqBlock(marketFaq(market))].filter(Boolean)),
    "## Questions sellers ask",
    faqBlock(VENDOR_FAQ),
    "## Questions partners ask",
    faqBlock(PARTNER_FAQ),
    ...GUIDES.flatMap((guide) => [
      `## ${guide.title}`,
      `Source: ${absoluteUrl(`/guides/${guide.slug}`)}`,
      ...guide.sections.map((section) => `### ${section.heading}\n\n${section.paragraphs.join("\n\n")}`),
    ]),
  ];
  return `${sections.join("\n\n")}\n`;
}
