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
      { title: "Connect your Shopify store", body: `In ${BRAND.name}, open Integrations, choose Shopify and press Connect. You get a link for your store.` },
      {
        title: "Add one webhook in Shopify",
        body: "In your Shopify admin, open Settings → Notifications → Webhooks, create a webhook for Order payment and paste your link. Then copy Shopify's signing key back into Posygo.",
      },
      { title: "Match your SKUs", body: `Make sure each product's SKU in Shopify matches its ${BRAND.name} product code.` },
      { title: "Orders arrive on their own", body: "Every paid order reaches the hub in seconds. Unpaid or cancelled orders are skipped, and an order is never placed twice." },
    ],
    faq: [
      { question: "Do I need to install an app?", answer: "No. You add one webhook in your Shopify settings, which takes about five minutes. Nothing changes in your theme or checkout." },
      { question: "Which Shopify orders come through?", answer: "Only paid orders. Unpaid and cancelled orders are skipped, and if Shopify sends the same order again, it isn't placed twice." },
      ...SHARED_FAQ,
    ],
  },
  woocommerce: {
    slug: "woocommerce",
    name: "WooCommerce",
    title: "WooCommerce fulfilment for African brands selling abroad",
    description: `Connect your WooCommerce store to ${BRAND.name}: we store your stock in your customers' country, every paid WooCommerce order comes to us automatically, and we pack and deliver it in days.`,
    intro: `Your shop runs on WordPress and WooCommerce and your customers are abroad. Store your stock with ${BRAND.name} in their country, and every paid WooCommerce order comes straight to the hub to be packed and delivered locally in days, with tracking.`,
    steps: [
      { title: "Send your stock to a hub", body: `Create your ${BRAND.name} account, add your products and send your stock in bulk to the hub in your customers' country.` },
      { title: "Connect your WooCommerce store", body: `In ${BRAND.name}, open Integrations, choose WooCommerce and press Connect. You get a link and a secret.` },
      { title: "Add one webhook in WordPress", body: "In WordPress, open WooCommerce → Settings → Advanced → Webhooks, add a webhook for Order updated and paste the link and the secret." },
      { title: "Match your SKUs", body: `Make sure each product's SKU in WooCommerce matches its ${BRAND.name} product code.` },
      { title: "Orders arrive on their own", body: "When an order is marked Processing, it reaches the hub in seconds. Orders waiting for payment are skipped, and an order is never placed twice." },
    ],
    faq: [
      { question: "Do I need a plugin?", answer: "No. You add one webhook in your WooCommerce settings, which takes about five minutes. Nothing changes on your website." },
      {
        question: "Which WooCommerce orders come through?",
        answer: "Orders that are Processing or Completed. Orders waiting for payment are skipped, and if WooCommerce sends the same order again, it isn't placed twice.",
      },
      ...SHARED_FAQ,
    ],
  },
};

export function storePlatformPath(slug: StorePlatformSlug): string {
  return `/integrations/${slug}`;
}
