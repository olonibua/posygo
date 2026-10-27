import type { BuyerLinkInput, CheckoutInput, ReturnRequestInput, ShipTo, ShoppingCheckoutInput } from "@/shared";

import { describePage, type FieldHelp } from "@/features/assistant/knowledge/types";

export const SHIP_TO_HELP: Record<Exclude<keyof ShipTo, "countryCode">, FieldHelp> = {
  name: { labels: ["Full name"], meaning: "The full name of the person receiving the parcel.", mistakes: ["At least 2 characters."] },
  line1: { labels: ["Address"], meaning: "The first line of the delivery address: house number and street.", mistakes: ["Put flat or unit numbers in the second line."] },
  line2: { labels: ["Address line 2 (optional)"], meaning: "Extra address details like a flat, unit or building name." },
  city: { labels: ["Town or city"], meaning: "The town or city of the delivery address." },
  region: { labels: [/^(Region|State|County|Province|Bundesland)/], meaning: "The state, county or region. Some countries require it, and some give you a list to choose from." },
  postalCode: {
    labels: [/^(Postcode|ZIP code|Postal code|PLZ)/],
    meaning: "The postcode or ZIP code of the delivery address. The courier uses it to route the parcel.",
    mistakes: ["It has to match the format for the destination country."],
  },
  phone: {
    labels: [/^Phone/],
    meaning: "A number the courier can call if they can't find you. It's required when the parcel crosses a border.",
    mistakes: ["Use digits, spaces, brackets or dashes, with an optional + at the start."],
  },
};

export const STORE_KNOWLEDGE = describePage({
  route: "/store/[slug]",
  title: "Store",
  purpose: "Browse one seller's products and add them to your basket for this store.",
  steps: ["Look through the products.", "Press Add to basket on anything you want.", "Press Check out at the bottom of the screen when you're ready to pay."],
  fields: {},
  related: [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/account", label: "Your orders" },
    { href: "/track", label: "Track a parcel" },
  ],
});

export const STORE_CHECKOUT_KNOWLEDGE = describePage<CheckoutInput & ShipTo & CheckoutInput["items"][number]>({
  route: "/store/[slug]/checkout",
  title: "Checkout",
  purpose: "Check your basket, say where it's going, see the delivery options and total, then pay on a secure card page.",
  steps: [
    "Check what's in your basket and change the amounts if you need to.",
    "Fill in the delivery address.",
    "Add your email so we can send your receipt and tracking.",
    "Add a discount code if you have one, then press See delivery and total.",
    "Choose a delivery speed and press Pay.",
  ],
  fields: {
    items: { labels: [], meaning: "The products in your basket for this store. Your basket is kept in this browser." },
    productId: { labels: [], meaning: "The product on each basket line." },
    quantity: {
      labels: [/^Quantity of /],
      meaning: "How many of this product you want. Use the minus and plus buttons; going down to zero removes it from the basket.",
      mistakes: ["Up to 99 of each product."],
    },
    shipTo: { labels: [], meaning: "The delivery address, made up of the address boxes on this page." },
    countryCode: {
      labels: ["Country"],
      meaning: "The country the parcel is going to. Only countries this store delivers to are listed.",
      mistakes: ["If it crosses a border, you may pay import duties when it arrives, and a phone number is needed."],
    },
    ...SHIP_TO_HELP,
    buyerEmail: { labels: ["Email"], meaning: "Where we send your receipt and tracking. You also use it to sign in and see your orders later." },
    buyerName: { labels: ["Name on the order (optional)"], meaning: "The name for the order. Leave it blank to use the delivery name." },
    discountCode: {
      labels: ["Discount code (optional)"],
      meaning: "A code from the store that takes money off. It's checked when you see the total.",
      mistakes: ["Up to 40 characters.", "If the code can't be used, the reason shows under the box."],
    },
    deliverySpeed: { labels: ["Delivery"], meaning: "How fast you want it. Each option shows its expected delivery time and price, and the total updates to match." },
  },
  related: [
    { href: "/account", label: "Your orders" },
    { href: "/track", label: "Track a parcel" },
  ],
});

export const CHECKOUT_SANDBOX_KNOWLEDGE = describePage({
  route: "/checkout/sandbox",
  title: "Practice payment",
  purpose: "A test-mode payment page for store orders. No card is charged.",
  steps: ["Check the order details.", "Press Pay to complete the practice payment, or Go back to return to the store."],
  fields: {},
  related: [
    { href: "/account", label: "Your orders" },
    { href: "/marketplace", label: "Marketplace" },
  ],
});

export const CHECKOUT_COMPLETE_KNOWLEDGE = describePage({
  route: "/checkout/complete",
  title: "Your order",
  purpose: "Shows whether your store order is paid, with your receipt and a tracking link once it has shipped.",
  steps: [
    "Wait a few seconds while we confirm your payment.",
    "Check the receipt. A copy is emailed to you.",
    "If the payment didn't go through, you haven't been charged; go back to the store to try again.",
  ],
  fields: {},
  related: [
    { href: "/account", label: "See all your orders" },
    { href: "/track", label: "Track a parcel" },
  ],
});

export const ACCOUNT_KNOWLEDGE = describePage<BuyerLinkInput & ReturnRequestInput & ShoppingCheckoutInput>({
  route: "/account",
  title: "Your orders",
  purpose: "See what you've ordered from stores here, ask for returns, and pay for things we're shopping for you.",
  steps: [
    "Enter the email you used at checkout and we'll email you a sign-in link. No password needed.",
    "Open the link to see your store orders.",
    "Use Return this order if you want to send something back while returns are open.",
    "Switch to Shopping requests to pay for a price we've sent you.",
  ],
  fields: {
    email: { labels: ["Email"], meaning: "The email you used when you ordered. If it has orders here, we send a sign-in link that works once and lasts 15 minutes." },
    reason: { labels: ["What went wrong?"], meaning: "Tell the store why you want to return the order. The store reads this before deciding.", mistakes: ["At least 10 characters, up to 1,000."] },
    deliverySpeed: {
      labels: ["Delivery"],
      meaning: "For a shopping request that's ready to pay: how fast you want it sent. Each option shows its time and price, and the total updates to match.",
      mistakes: ["The price holds until the date shown. After that we send a new one."],
    },
  },
  related: [
    { href: "/track", label: "Track a parcel" },
    { href: "/shop-for-me", label: "Ask us to shop for you" },
    { href: "/marketplace", label: "Marketplace" },
  ],
});

export const ACCOUNT_SIGN_IN_KNOWLEDGE = describePage({
  route: "/account/sign-in",
  title: "Signing in",
  purpose: "Signs you in from the link we emailed, then takes you to your orders.",
  steps: ["Open this page from the sign-in link in your email.", "Wait a moment while we sign you in.", "If the link has run out or was already used, ask for a new one."],
  fields: {},
  related: [{ href: "/account", label: "Get a new link" }],
});

export const MARKETPLACE_KNOWLEDGE = describePage({
  route: "/marketplace",
  title: "Marketplace",
  purpose: "Browse products from independent sellers in one country, all packed and sent from a local warehouse with tracking.",
  steps: ["Choose a country if more than one is shown.", "Browse the products.", "Open a seller's name to visit their store and buy from it."],
  fields: {},
  related: [
    { href: "/account", label: "Your orders" },
    { href: "/track", label: "Track a parcel" },
    { href: "/shop-for-me", label: "Ask us to shop for you" },
  ],
});
