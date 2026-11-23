import { BRAND } from "@/lib/brand";

import { AFRICAN_SELLER_COUNTRIES } from "./african-brands-copy";
import type { FaqItem } from "./faq";
import type { SellerStep } from "./african-brands-copy";

export type StorePlatformSlug = "shopify" | "woocommerce";

export interface StorePlatformPage {
  slug: StorePlatformSlug;
  name: string;
  title: string;
  description: string;
  intro: string;
  steps: SellerStep[];
  faq: FaqItem[];
  guide: string;
}

const SHARED_FAQ: FaqItem[] = [
  {
    question: "How does Posygo know which product to send?",
    answer: `Each product's SKU in your shop must match its product code in ${BRAND.name}. When an order arrives, we match the SKU and the hub picks exactly that item.`,
  },
  {
    question: "What happens if I'm out of stock at the hub?",
    answer: `The order shows as needing attention in your ${BRAND.name} dashboard, with the reason, so you can send more stock or handle that order yourself.`,
  },
  { question: "I don't have a developer. Can you set it up for me?", answer: `Yes. Message us and we'll connect your shop with you on a short call, at no extra cost.` },
  {
    question: `Can I use ${BRAND.name} if my business is in Africa?`,
    answer: `Yes. Brands in ${AFRICAN_SELLER_COUNTRIES} and across Africa send their stock in bulk to a ${BRAND.name} hub in their customers' country, then every order from their shop is packed and delivered locally in days.`,
  },
];

export const STORE_PLATFORMS: Record<StorePlatformSlug, StorePlatformPage> = {
  shopify: {
    slug: "shopify",
    name: "Shopify",
    title: "Shopify fulfilment for African brands selling abroad",
    description: `Connect your Shopify store to ${BRAND.name}: we store your stock in your customers' country, every paid Shopify order comes to us automatically, and we pack and deliver it in days.`,
    intro: `Your shop runs on Shopify and your customers are abroad. Store your stock with ${BRAND.name} in their country, and every paid Shopify order comes straight to the hub to be packed and delivered locally in days, with tracking. No copying orders by hand.`,
    steps: [
      { title: "Send your stock to a hub", body: `Create your ${BRAND.name} account, add your products and send your stock in bulk to the hub in your customers' country.` },
      { title: `Install the ${BRAND.name} app`, body: `Add the ${BRAND.name} app to your Shopify store. In ${BRAND.name}, open Integrations and create an API key, then paste it into the app and choose the country you ship from.` },
      { title: `Stock products at the ${BRAND.name} location`, body: `The app adds a ${BRAND.name} location to your store. Set each product's SKU to its ${BRAND.name} product code and stock it at that location.` },
      { title: "Request fulfillment on paid orders", body: "Open a paid order and click Request fulfillment, or turn on automatic fulfillment in Shopify's order processing settings. The order reaches the hub in seconds." },
      { title: "Tracking comes back to Shopify", body: "When the hub ships, the tracking goes back to Shopify, the order is marked fulfilled and Shopify emails your customer." },
    ],
    faq: [
      { question: "Do I need to install an app?", answer: `Yes, the free ${BRAND.name} app. It adds a ${BRAND.name} location to your store and nothing changes in your theme or checkout. You pay ${BRAND.name} only for storage and fulfilment.` },
      {
        question: "Which Shopify orders go to the hub?",
        answer: `Paid orders for products stocked at the ${BRAND.name} location, once fulfillment is requested. Shopify can request it for you automatically if the hub ships all your orders.`,
      },
      { question: "Can I cancel an order after it reaches the hub?", answer: "Yes, until the hub has packed it. Cancel the fulfillment request in Shopify and the hub won't send it." },
      ...SHARED_FAQ,
    ],
    guide: "/guides/posygo-shopify-guide.pdf",
  },
  woocommerce: {
    slug: "woocommerce",
    name: "WooCommerce",
    title: "WooCommerce fulfilment for African brands selling abroad",
    description: `Connect your WooCommerce store to ${BRAND.name}: we store your stock in your customers' country, every paid WooCommerce order comes to us automatically, and we pack and deliver it in days.`,
    intro: `Your shop runs on WordPress and WooCommerce and your customers are abroad. Store your stock with ${BRAND.name} in their country, and every paid WooCommerce order comes straight to the hub to be packed and delivered locally in days, with tracking.`,
    steps: [
      { title: "Send your stock to a hub", body: `Create your ${BRAND.name} account, add your products and send your stock in bulk to the hub in your customers' country.` },
      { title: `Install the ${BRAND.name} Fulfilment plugin`, body: `In WordPress, open Plugins → Add New Plugin and install ${BRAND.name} Fulfilment, then activate it.` },
      { title: "Paste your API key", body: `In ${BRAND.name}, open Integrations and create an API key. In WordPress, open WooCommerce → Settings → Integration → ${BRAND.name} Fulfilment, paste the key and choose your hub country.` },
      { title: "Match your SKUs", body: `Make sure each product's SKU in WooCommerce matches its ${BRAND.name} product code.` },
      { title: "Orders arrive on their own", body: "When an order becomes Processing, it reaches the hub in seconds. When it ships, the order is completed and your customer gets the tracking by email." },
    ],
    faq: [
      { question: "Do I need a plugin?", answer: `Yes, the free ${BRAND.name} Fulfilment plugin. It takes about five minutes to set up and nothing changes on your website.` },
      {
        question: "Which WooCommerce orders come through?",
        answer: "Orders that become Processing, which means paid. Orders waiting for payment are skipped, and an order is never placed twice.",
      },
      ...SHARED_FAQ,
    ],
    guide: "/guides/posygo-woocommerce-guide.pdf",
  },
};

export function storePlatformPath(slug: StorePlatformSlug): string {
  return `/integrations/${slug}`;
}
