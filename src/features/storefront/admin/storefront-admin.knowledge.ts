import type { ReturnDecisionInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const ADMIN_STORE_ORDERS_KNOWLEDGE = describePage<Record<"amountMinor" | "note", unknown>>({
  route: "/admin/storefront-orders",
  title: "Store orders",
  purpose: "Orders buyers paid for on vendor stores. We hold the vendor's share until the return window closes, then send it to their bank.",
  steps: [
    "Filter by status and open an order.",
    "Check the totals, the vendor's and platform's shares and when the payout is due.",
    "If the transfer to the vendor's bank failed, check their payout account and retry the payout.",
    "To refund the buyer, enter the amount and a reason, then refund.",
  ],
  fields: {
    amountMinor: { labels: ["Amount"], meaning: "How much to refund the buyer. It starts at what's left to refund on the order.", mistakes: ["It can't be more than what's left to refund."] },
    note: { labels: ["Reason"], meaning: "Why the buyer is being refunded. They see it in their refund email.", mistakes: ["At least 5 characters."] },
  },
  related: [{ href: "/admin/storefront-returns", label: "Store returns" }],
});

export const ADMIN_STORE_RETURNS_KNOWLEDGE = describePage<ReturnDecisionInput>({
  route: "/admin/storefront-returns",
  title: "Store returns",
  purpose: "Stores decide their own returns. Step in when a store is slow to answer or a refund didn't go through. The vendor's payout stays held while a return is open.",
  steps: [
    "Start with returns waiting for a decision.",
    "Read the buyer's reason and the items.",
    "Write a message to the buyer, then accept and refund, or turn it down.",
    "If an accepted refund didn't go through, try the refund again.",
  ],
  fields: {
    accept: { labels: [], meaning: "Whether the return is accepted and refunded or turned down. You choose with the buttons." },
    refundMinor: { labels: ["Refund"], meaning: "How much to refund the buyer when you accept the return.", mistakes: ["It can't be more than what's left to refund on the order."] },
    note: { labels: ["Message to the buyer"], meaning: "What happens next, for example whether they can keep the item.", mistakes: ["At least 3 characters."] },
  },
  related: [{ href: "/admin/storefront-orders", label: "Store orders" }],
});
