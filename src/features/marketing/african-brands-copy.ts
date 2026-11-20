import type { PublicCountry } from "@/shared";

import { BRAND } from "@/lib/brand";

import type { FaqItem } from "./faq";
import type { Market } from "./market-data";
import { capitalised, countryPath, countryPhrase, fulfilmentWord, shortName } from "./markets";
import { costFaq } from "./market-copy";

export const AFRICAN_SELLER_COUNTRIES = "Nigeria, Ghana, Kenya, South Africa";

export interface SellerStep {
  title: string;
  body: string;
}

export function africanBrandsPath(country: Pick<PublicCountry, "name">): string {
  return `${countryPath(country)}/african-brands`;
}

export function africanBrandsTitle(country: Pick<PublicCountry, "code" | "name">): string {
  const short = shortName(country.code);
  return `${capitalised(fulfilmentWord(country.code))} for African brands selling to ${countryPhrase(country)}${short ? ` (${short})` : ""}`;
}

export function africanBrandsDescription(country: Pick<PublicCountry, "name">): string {
  const place = countryPhrase(country);
  return `Selling from ${AFRICAN_SELLER_COUNTRIES} or anywhere in Africa to customers in ${place}? Send your stock in bulk, we store it in ${place}, then pack and deliver each order locally in days, tracked. No subscription.`;
}

export function africanBrandsSteps(country: Pick<PublicCountry, "name" | "currency">): SellerStep[] {
  const place = countryPhrase(country);
  return [
    { title: "Create your seller account", body: `Sign up from anywhere in Africa, add your products and pay in ${country.currency} by card. You don't need a company in ${place}.` },
    {
      title: "Send your stock in bulk",
      body: `Ship one consignment by air or sea with the cargo agent you already use. We give you the address in ${place}, and you clear customs once for the whole shipment.`,
    },
    { title: "We count and photograph it", body: "When your boxes arrive, every unit is counted and photographed, then shows in your stock, ready to sell." },
    { title: "Orders come straight to us", body: "Connect your Shopify or WooCommerce shop so paid orders arrive automatically, connect your own website, or create orders in your dashboard." },
    { title: "Delivered locally in days", body: `Each order is packed and handed to a local carrier in ${place}, with tracking. Your customer gets a local parcel with nothing to pay at the door.` },
  ];
}

export function africanBrandsComparison(country: Pick<PublicCountry, "name">): { from: string[]; local: string[] } {
  return {
    from: ["A week or more in transit for every order", "An international courier fee on every parcel", "Customers may be asked to pay import charges at the door"],
    local: [`Delivered in days by a carrier in ${countryPhrase(country)}`, "Local postage on every parcel", "Nothing for your customer to pay at the door"],
  };
}

export function africanBrandsFaq(market: Market): FaqItem[] {
  const place = countryPhrase(market.country);
  const word = fulfilmentWord(market.country.code);
  const cost = costFaq(market);
  return [
    {
      question: `Can I use ${BRAND.name} if my business is in Nigeria or elsewhere in Africa?`,
      answer: `Yes. ${BRAND.name} is built for brands that sell from Africa to customers abroad. You don't need a company or a bank account in ${place}: you sign up online, pay in ${market.country.currency} by card and manage your stock and orders from your phone.`,
    },
    {
      question: `How do I get my stock to ${place}?`,
      answer: `Send it in bulk by air or sea with the cargo agent you already trust. We give you the address in ${place}, you add the tracking number to your shipment, and we count and photograph every unit when it arrives.`,
    },
    {
      question: "Who pays customs and import duty?",
      answer: `You clear customs once for each bulk shipment, usually through your cargo agent, who tells you the duty and VAT due. After that, each order travels as a local parcel inside ${place}, so your customer has nothing to pay at the door.`,
    },
    {
      question: `Which products work best with ${word} in ${place}?`,
      answer:
        "Products you keep in stock and sell in ranges: clothing and fabrics, hair and wigs, skincare and beauty, accessories and homeware. Made-to-order pieces aren't a fit, because we ship what's already on the shelf.",
    },
    {
      question: "Does it work with my Shopify or WooCommerce store?",
      answer: `Yes. Connect your shop in a few minutes and every paid order comes to us automatically. If you'd rather not set it up yourself, our team will do it with you, at no extra cost.`,
    },
    ...(cost ? [cost] : []),
  ];
}
