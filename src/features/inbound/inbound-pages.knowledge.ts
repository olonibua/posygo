import type { InboundMessageInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const SHIPMENTS_KNOWLEDGE = describePage<Record<"group", unknown>>({
  route: "/inbound",
  title: "Stock shipments",
  purpose: "Every stock shipment you've told a hub about, from draft to counted.",
  steps: [
    "Choose a tab to see shipments on the way, drafts, or finished ones.",
    "Open a shipment to check its products, boxes, charges and messages.",
    "Start a new shipment when you're ready to send more stock.",
  ],
  fields: {
    group: {
      labels: ["Filter shipments"],
      meaning:
        "On the way shows shipments you've submitted, including ones that have arrived or are on hold. Drafts are shipments you haven't submitted yet. Finished covers counted, refused, returned and cancelled shipments.",
    },
  },
  related: [
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/inventory", label: "Your stock" },
  ],
});

export const SHIPMENT_KNOWLEDGE = describePage<InboundMessageInput>({
  route: "/inbound/[id]",
  title: "Stock shipment",
  purpose: "One stock shipment: what you declared, what the hub counted, what it cost and any notes from the hub team.",
  steps: [
    "If it's still a draft, check the products and box counts, edit them if needed, then submit. The charge shown is taken from your wallet when you submit.",
    "Follow the status as the shipment travels, arrives and is counted.",
    "Once counted, compare the declared units with what was accepted, damaged, missing or extra.",
    "If the hub puts it on hold with a charge, read their note and pay the hold charge so they can carry on.",
    "Send the hub team a message if you have a question about the shipment.",
  ],
  fields: {
    body: {
      labels: ["Message"],
      meaning: "A message to the hub team about this shipment. Their replies appear in the same thread. Messages open once the shipment is submitted.",
      mistakes: ["The message can't be empty, and it can be up to 2000 characters."],
    },
  },
  related: [
    { href: "/inbound", label: "All stock shipments" },
    { href: "/wallet", label: "Top up your wallet" },
    { href: "/inventory", label: "Your stock" },
  ],
});
