import type { ShipTo, ShoppingRequestInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";
import { SHIP_TO_HELP } from "@/features/storefront/storefront.knowledge";

export const SHOP_FOR_ME_KNOWLEDGE = describePage<ShoppingRequestInput & ShipTo & ShoppingRequestInput["lines"][number]>({
  route: "/shop-for-me",
  title: "Shop for me",
  purpose: "Send us links to things you want from shops in one of our countries. We price everything up front, buy it once you've paid, and send it to you in one parcel.",
  steps: [
    "Choose the country whose shops you want to buy from.",
    "Paste a link for each item and say the size, colour or model and how many.",
    "Fill in where the parcel should go and your email.",
    "Press Ask for a price, then open the confirmation link we email you within 48 hours.",
    "We email you a price. You pay nothing until you accept it.",
  ],
  fields: {
    countryCode: { labels: ["Shops in"], meaning: "The country whose shops we buy from. Items are sent on from our warehouse there, and it changes which delivery countries you can pick." },
    lines: { labels: [], meaning: "The items you want, one row each. Use Add another item for more.", mistakes: ["Add at least one item.", "Up to 15 items per request."] },
    url: { labels: [/^Item \d+ link$/], meaning: "The full web address of the item on the shop's website.", example: "https://", mistakes: ["Paste the full link, starting with https://."] },
    description: {
      labels: ["Size, colour, model"],
      meaning: "Exactly which version you want, so we buy the right one.",
      example: "Size 8, navy blue",
      mistakes: ["At least 3 characters, up to 300."],
    },
    quantity: { labels: ["How many"], meaning: "How many of this item you want.", mistakes: ["Between 1 and 99."] },
    notes: { labels: ["Anything else we should know? (optional)"], meaning: "Anything that helps us buy the right thing, like a backup choice if your size is sold out." },
    shipTo: {
      labels: ["Country"],
      meaning: "The country the parcel is going to. Only places we can send to from the shops' country are listed.",
      mistakes: ["If it crosses a border, you may pay import duties when it arrives, and a phone number is needed."],
    },
    ...SHIP_TO_HELP,
    buyerEmail: { labels: ["Email"], meaning: "Where we send the confirmation link, the price and updates." },
    buyerName: { labels: ["Your name (optional)"], meaning: "Your name for the request. Leave it blank to use the delivery name." },
  },
  related: [
    { href: "/account", label: "Your orders and shopping requests" },
    { href: "/track", label: "Track a parcel" },
  ],
});

export const SHOPPING_CONFIRM_KNOWLEDGE = describePage({
  route: "/shopping/confirm",
  title: "Confirm your request",
  purpose: "Confirms your shop-for-me request from the link we emailed, so we can start pricing it.",
  steps: [
    "Open this page from the link in your email.",
    "Wait a moment while we confirm the request.",
    "We email you a price for everything, including our fee and delivery. You pay nothing until you accept it.",
  ],
  fields: {},
  related: [
    { href: "/account", label: "Follow your request" },
    { href: "/shop-for-me", label: "Send a new request" },
  ],
});

export const SHOPPING_SANDBOX_KNOWLEDGE = describePage({
  route: "/shopping/sandbox",
  title: "Practice payment",
  purpose: "A test-mode payment page for shop-for-me requests. No card is charged.",
  steps: ["Check the items and total.", "Press Pay to complete the practice payment, or Go back to return to your shopping requests."],
  fields: {},
  related: [
    { href: "/account", label: "Your shopping requests" },
    { href: "/shop-for-me", label: "Shop for me" },
  ],
});
