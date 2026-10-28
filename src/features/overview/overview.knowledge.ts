import { describePage } from "@/features/assistant/knowledge/types";

export const OVERVIEW_KNOWLEDGE = describePage({
  route: "/overview",
  title: "Overview",
  purpose: "A quick look at your business in the country you've chosen at the top of the page: stock on the way, units in storage, orders today and your wallet balance.",
  steps: [
    "Use the country menu at the top of the page to choose a country, or All countries to see them side by side.",
    "Check the tiles for shipments on the way, units in storage, orders today and the wallet balance in that country.",
    "If there's a next step card, follow it to finish verifying your business, accept an agreement or pay the activation fee.",
    "Under Your countries, each card shows that country's wallet, stock and orders today in its own currency. Choose a card to switch to it.",
  ],
  fields: {},
  related: [
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/verification", label: "Verify your business" },
    { href: "/wallet", label: "Wallet" },
    { href: "/settings/markets", label: "Where you store stock" },
  ],
});
