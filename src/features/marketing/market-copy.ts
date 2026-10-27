import type { FaqItem } from "./faq";
import type { Market } from "./market-data";
import { capitalised, countryPhrase, fulfilmentWord, shortName } from "./markets";

import { formatMoney } from "@/lib/format";

export function marketTitle(market: Market): string {
  const short = shortName(market.country.code);
  return `${capitalised(fulfilmentWord(market.country.code))} in ${countryPhrase(market.country)}${short ? ` (${short})` : ""} for online sellers`;
}

export function marketDescription(market: Market): string {
  const word = fulfilmentWord(market.country.code);
  const name = countryPhrase(market.country);
  const packing = market.prices ? ` Packing from ${money(market, market.prices.schedule.fulfilment.baseMinor)}.` : "";
  return `Ecommerce ${word} in ${name}: vetted local hubs store your stock, pack every order and ship it tracked. No subscription.${packing}`;
}

function money(market: Market, minor: number): string {
  return formatMoney(minor, market.country.currency, market.country.locale);
}

function cheapestStorage(market: Market): number | null {
  const monthly = Object.values(market.prices?.schedule.monthlyStorage ?? {}).filter((value): value is number => value !== null);
  return monthly.length > 0 ? Math.min(...monthly) : null;
}

export function marketFaq(market: Market): FaqItem[] {
  const word = fulfilmentWord(market.country.code);
  const name = countryPhrase(market.country);
  const items: FaqItem[] = [];
  const prices = market.prices?.schedule;
  if (prices) {
    const storage = cheapestStorage(market);
    items.push({
      question: `How much does ${word} cost in ${name}?`,
      answer: [
        `Packing an order costs ${money(market, prices.fulfilment.baseMinor)}, plus ${money(market, prices.fulfilment.perAdditionalUnitMinor)} for each extra unit, up to ${money(market, prices.fulfilment.maxMinor)}.`,
        storage === null ? "" : ` Storage starts at ${money(market, storage)} a month per box.`,
        ` Shipping is the carrier's price plus ${prices.shippingMarkupBps / 100}%. There's no monthly subscription.`,
      ].join(""),
    });
  }
  items.push(
    {
      question: `Is my stock insured at a ${name} hub?`,
      answer:
        market.hub && market.hub.insuredCoverMinor > 0
          ? `Yes. Stock at our ${name} hubs is insured up to ${money(market, market.hub.insuredCoverMinor)}, and we hold the cover, not the partner. Every arrival and every parcel is photographed.`
          : `Yes. We hold the insurance for stock while it's at a hub, and every arrival and every parcel is photographed.`,
    },
    {
      question: `Do I need a company in ${name} to use ${word} there?`,
      answer: `No. You sign up as a seller, send stock to the hub we give you and pay in ${market.country.currency}. Orders are packed in ${name} and handed to a local carrier.`,
    },
    {
      question: `How do I start ${word} in ${name}?`,
      answer: `Create an account, add your products, then tell us what you're sending. We give you the hub address. When your boxes arrive they're counted and photographed, and your stock is ready to sell.`,
    },
  );
  return items;
}
