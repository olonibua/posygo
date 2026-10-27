import type { DeliveryInput, Recipient } from "@/shared";

import { orderReferenceFix } from "@/features/assistant/guidance/fixes";
import { describePage } from "@/features/assistant/knowledge/types";

export const NEW_ORDER_KNOWLEDGE = describePage<DeliveryInput & Recipient>({
  route: "/orders/new",
  title: "Create an order",
  purpose: "Send one or more of your products to a customer. The hub picks, packs and photographs the parcel, then hands it to a carrier with tracking.",
  steps: [
    "Choose where the parcel is going.",
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
    recipient: { labels: ["Ship to"], meaning: "The country the parcel is going to. Only destinations your market ships to are listed." },
    name: { labels: ["Recipient name"], meaning: "The full name of the person receiving the parcel." },
    company: { labels: ["Company (optional)"], meaning: "A company name, if the parcel is going to a business address." },
    line1: { labels: ["Address"], meaning: "The first line of the delivery address: house number and street.", mistakes: ["Put flat or unit numbers in the second line."] },
    line2: { labels: ["Address line 2 (optional)"], meaning: "Extra address details like a flat, unit or building name." },
    city: { labels: ["Town or city"], meaning: "The town or city of the delivery address." },
    region: { labels: [/^(Region|State|County|Province)/], meaning: "The state, county or province. Some countries require it, like US states." },
    postalCode: {
      labels: [/^(Postcode|ZIP code|Postal code)/],
      meaning: "The postcode or ZIP code of the delivery address. Carriers use it to route the parcel.",
      mistakes: ["It has to match the format for the destination country."],
    },
    countryCode: { labels: [], meaning: 'The destination country, set by "Ship to".' },
    phone: { labels: [/^Phone/], meaning: "A phone number the carrier can call about delivery. Required when the parcel goes through customs." },
    email: { labels: ["Email (optional)"], meaning: "The customer's email, so the carrier can send delivery updates." },
    lines: {
      labels: [/^Product \d+$/, "Units"],
      meaning: "Each product to send and how many units. Only stock that's in the hub can be ordered.",
      mistakes: ["Each product can only appear once.", "If there isn't enough stock in one hub, the order can't be accepted."],
    },
  },
  related: [
    { href: "/inventory", label: "Your stock" },
    { href: "/orders/import", label: "Import orders from a spreadsheet" },
    { href: "/wallet", label: "Top up your wallet" },
  ],
});
