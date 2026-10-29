import type { DeliveryInput, Recipient } from "@/shared";

import { orderReferenceFix } from "@/features/assistant/guidance/fixes";
import { describePage } from "@/features/assistant/knowledge/types";

export const NEW_ORDER_KNOWLEDGE = describePage<DeliveryInput & Recipient>({
  route: "/orders/new",
  title: "Create an order",
  purpose:
    "Send one or more of your products to a customer in the country you've chosen at the top of the page. It's picked, packed and photographed from your stock in that country, then handed to a carrier with tracking.",
  steps: [
    "Check the country at the top of the page. The order is sent from your stock there, to an address in the same country.",
    "Add the customer's name and address exactly as the carrier needs it.",
    "Add each product and how many units.",
    "Create the order. Packing and shipping are taken from your wallet when the order is accepted.",
  ],
  fields: {
    externalReference: {
      labels: ["Your reference (optional)"],
      meaning: "Your shop's own order number, so you can find this order later and match it to your sale.",
      example: "SHOP-10293",
      mistakes: ["Each order needs its own reference.", "Up to 64 letters, numbers or . _ : # / -"],
      fix: orderReferenceFix,
    },
    recipient: { labels: [], meaning: "Who the parcel goes to. The address has to be in the country you've chosen at the top of the page." },
    name: { labels: ["Recipient name"], meaning: "The full name of the person receiving the parcel." },
    company: { labels: ["Company (optional)"], meaning: "A company name, if the parcel is going to a business address." },
    line1: { labels: ["Address"], meaning: "The first line of the delivery address: house number and street.", mistakes: ["Put flat or unit numbers in the second line."] },
    line2: { labels: ["Address line 2 (optional)"], meaning: "Extra address details like a flat, unit or building name." },
    city: { labels: ["Town or city"], meaning: "The town or city of the delivery address." },
    region: { labels: [/^(Region|State|County|Province)/], meaning: "The state, county or province. Some countries require it, like US states." },
    postalCode: {
      labels: [/^(Postcode|ZIP code|Postal code)/],
      meaning: "The postcode or ZIP code of the delivery address. Carriers use it to route the parcel.",
      mistakes: ["It has to match the format for the country the order is in."],
    },
    countryCode: { labels: [], meaning: "Set for you: the country you've chosen at the top of the page. Orders only go to addresses in that country." },
    phone: { labels: [/^Phone/], meaning: "A phone number the carrier can call about delivery. Optional." },
    email: { labels: ["Email (optional)"], meaning: "The customer's email, so the carrier can send delivery updates." },
    deliveryPreference: {
      labels: ["Delivery"],
      meaning: "How you'd like this order sent. Cheapest picks the lowest price even if it takes longer; Fastest picks the quickest delivery even if it costs more. The hub sees your choice first when it books the courier.",
    },
    lines: {
      labels: [/^Product \d+$/, "Units"],
      meaning: "Each product to send and how many units. Only stock you have in this country can be ordered.",
      mistakes: ["Each product can only appear once.", "If there isn't enough stock in this country, the order can't be accepted."],
    },
  },
  related: [
    { href: "/inventory", label: "Your stock" },
    { href: "/orders/import", label: "Import orders from a spreadsheet" },
    { href: "/wallet", label: "Top up your wallet" },
  ],
});
