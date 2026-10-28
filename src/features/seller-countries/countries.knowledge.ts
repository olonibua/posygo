import type { AddVendorCountryInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const COUNTRIES_KNOWLEDGE = describePage<AddVendorCountryInput>({
  route: "/settings/markets",
  title: "Where you store stock",
  purpose:
    "See every country where you store stock and add more. Each country has its own stock, orders and wallet in its own currency. Orders are always sent from stock in the same country, to an address in that country.",
  steps: [
    "Check the countries you already store stock in. Home is the country you signed up with.",
    "To sell somewhere new, choose the country under Add a country and select Add country.",
    "It opens straight away with its own wallet. Switch to it with the country menu at the top of the page, then send stock there.",
  ],
  fields: {
    countryCode: {
      labels: ["Add a country"],
      meaning: "A country that's open on Posygo where you don't store stock yet. Adding it gives you a wallet in its currency, and you can send stock there right away.",
      mistakes: ["Only open countries are listed.", "Each country can only be added once."],
    },
  },
  related: [
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/wallet", label: "Wallet" },
    { href: "/overview", label: "Overview" },
  ],
});
