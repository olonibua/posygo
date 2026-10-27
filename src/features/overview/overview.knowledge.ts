import { describePage } from "@/features/assistant/knowledge/types";

export const OVERVIEW_KNOWLEDGE = describePage<Record<"destinations", unknown>>({
  route: "/overview",
  title: "Overview",
  purpose: "A quick look at your business: stock on the way, units in storage, your wallet balance and where you can ship.",
  steps: [
    "Check the tiles for shipments on the way, units in storage, open destinations and your wallet balance.",
    "If there's a next step card, follow it to finish verifying your business or accept an agreement.",
    "Start a new stock shipment once your account is live.",
    "Look through the list of places you can ship to, filtered by domestic or international.",
  ],
  fields: {
    destinations: { labels: ["Filter destinations"], meaning: "Narrows the list of places you can ship to. Domestic is your own country; international destinations need a customs declaration." },
  },
  related: [
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/verification", label: "Verify your business" },
    { href: "/wallet", label: "Wallet" },
    { href: "/settings/markets", label: "Where you usually ship" },
  ],
});
