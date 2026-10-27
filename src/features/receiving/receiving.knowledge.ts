import type { InboundMessageInput, InboundReasonInput, ReceiveInboundInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const RECEIVING_QUEUE_KNOWLEDGE = describePage({
  route: "/admin/receiving",
  title: "Receiving",
  purpose: "Shipments vendors are sending to the hub, soonest first.",
  steps: [
    "Start with Due to see shipments expected soon.",
    "Filter by status to find shipments on hold, refused or received.",
    "Open a shipment when it reaches the dock to check it in and count it.",
  ],
  fields: {},
  related: [{ href: "/admin/stock", label: "Stock" }],
});

export const RECEIVING_CASE_KNOWLEDGE = describePage<ReceiveInboundInput & InboundReasonInput & InboundMessageInput & Record<"chargeMinor", unknown>>({
  route: "/admin/receiving/[id]",
  title: "Inbound shipment",
  purpose: "One vendor shipment: check it in at the dock, count every box and unit, and record what arrived.",
  steps: [
    "Press Check in at the dock when the delivery arrives.",
    "If something's wrong, put it on hold, refuse it or return it to the sender, with a reason the vendor will see.",
    "Press Record counts. Count the boxes by size, photograph the shipment, and enter good and damaged units for each product.",
    "Save the counts, then print the lot labels and stick one on each lot.",
    "Use Messages to talk to the vendor about this shipment.",
  ],
  fields: {
    boxCounts: {
      labels: ["Small", "Medium", "Large", "Extra large", "Pallet"],
      meaning: "How many boxes of each size actually arrived. It starts with what the vendor declared; change it to what you counted.",
      mistakes: ["Up to 500 boxes of each size."],
    },
    photoFileIds: {
      labels: ["Photo of the shipment", /^Photo of the shipment \d+$/, "Choose file"],
      meaning: "Photos of every box with the labels visible.",
      mistakes: ["Add at least one photo of the shipment.", "Up to 30 photos."],
    },
    lines: {
      labels: ["Good units", "Damaged units", "Photo of the damage", /^Photo of the damage \d+$/, "Note"],
      meaning:
        "For each product, how many good units and damaged units you counted, with an optional note. It starts with the declared amount. Any difference from what was declared is reported to the vendor.",
      mistakes: ["Photograph the damaged units on every line that has them."],
    },
    note: { labels: ["Notes for the vendor"], meaning: "Anything the vendor should know about how the shipment arrived. Optional.", mistakes: ["Up to 1000 characters."] },
    reason: {
      labels: ["Reason the vendor will see"],
      meaning: "Why you're putting the shipment on hold, refusing it or returning it to the sender. The vendor sees it.",
      mistakes: ["At least 10 characters."],
    },
    chargeMinor: {
      labels: ["Charge for the extra work (optional)"],
      meaning:
        "Only for platform staff putting a shipment on hold: a charge for the extra work. The vendor pays it from their wallet before you carry on. Leave it empty for no charge. Releasing the hold waives it.",
      mistakes: ["Enter a valid amount, or leave it empty."],
    },
    body: { labels: ["Message"], meaning: "A message to the vendor about this shipment.", mistakes: ["Up to 2000 characters."] },
  },
  related: [
    { href: "/admin/receiving", label: "Receiving" },
    { href: "/admin/stock", label: "Stock" },
  ],
});

export const LOT_LABELS_KNOWLEDGE = describePage({
  route: "/admin/receiving/[id]/labels",
  title: "Lot labels",
  purpose: "Printable labels for the lots in a counted shipment.",
  steps: ["Print the page.", "Stick one label on each lot before putting it away.", "Put the lots away from the Stock page."],
  fields: {},
  related: [
    { href: "/admin/receiving", label: "Receiving" },
    { href: "/admin/stock", label: "Stock" },
  ],
});
