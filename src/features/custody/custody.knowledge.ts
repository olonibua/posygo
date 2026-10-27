import type { AssessClaimInput, claimResponseSchema, CreateTransferInput, DecideClaimInput, DispatchTransferInput, ReceiveTransferInput, resolveAlertSchema } from "@/shared";
import type { z } from "zod";

import { describePage, type PageKnowledgeOf } from "@/features/assistant/knowledge/types";

export const CLAIMS_KNOWLEDGE = describePage<AssessClaimInput & DecideClaimInput>({
  route: "/admin/claims",
  title: "Claims",
  purpose: "Missing, damaged or lost stock. One person assesses who is responsible, someone else decides, and the vendor's wallet is credited with the agreed amount.",
  steps: [
    "Start with New claims and open one.",
    "Read the report and any response from the hub.",
    "Assess it: choose who is responsible, set the wallet credit and explain what you found.",
    "Someone who didn't open or assess the claim then approves and settles it, or doesn't accept it.",
  ],
  fields: {
    liability: {
      labels: ["Who is responsible?"],
      meaning:
        "Who caused the problem. The hub: recovered from the partner's balance, then their deposit, and we cover the rest. Us: we credit the vendor in full. The carrier: we credit the vendor and chase the carrier ourselves. The vendor: no credit.",
    },
    amountMinor: {
      labels: ["Wallet credit"],
      meaning: "How much wallet credit the vendor gets if the claim is settled.",
      mistakes: ["It can't be more than the declared value.", "It's zero when the vendor is responsible."],
    },
    writeOff: { labels: ["Write the units off our records"], meaning: "Removes the affected units from stock records. Only offered for claims about stock, not orders." },
    note: {
      labels: ["What you found", "Decision note"],
      meaning: "Your assessment, which the vendor and, if responsible, the hub will read. Or, when deciding, the note kept with your decision.",
      mistakes: ["An assessment note must be at least 10 characters.", "A decision note must be at least 5 characters."],
    },
    approve: {
      labels: [],
      meaning: "Whether the claim is settled or not accepted. You choose with the Approve and settle and Don't accept buttons. Approve and settle only appears once the claim is assessed.",
    },
  },
  related: [
    { href: "/admin/custody-alerts", label: "Custody alerts" },
    { href: "/admin/partners/stock-counts", label: "Stock counts" },
  ],
});

export const CUSTODY_ALERTS_KNOWLEDGE = describePage<z.infer<typeof resolveAlertSchema>>({
  route: "/admin/custody-alerts",
  title: "Custody alerts",
  purpose: "Early warnings from across the network: parcels the carrier never scanned, counts that came up short, hubs losing stock, and hubs paused for low trust.",
  steps: ["Look at the alerts that need a look.", "Open the partner to investigate.", "Press Resolve, write what you did and mark it resolved."],
  fields: { note: { labels: ["What you did"], meaning: "What you did about the alert. It's shown on the alert once resolved.", mistakes: ["At least 10 characters."] } },
  related: [
    { href: "/admin/claims", label: "Claims" },
    { href: "/admin/partners", label: "Fulfilment partners" },
  ],
});

export const ADMIN_TRANSFERS_KNOWLEDGE = describePage<CreateTransferInput>({
  route: "/admin/transfers",
  title: "Transfers",
  purpose: "Move a hub's free stock to another hub or warehouse in the same country.",
  steps: [
    "Choose where the stock is and where it's going.",
    "Explain why, then request the transfer. The sending hub is emailed.",
    "The sender seals and photographs it, and the receiver counts it in without seeing our numbers.",
    "Cancel a transfer that's no longer needed, if it hasn't been sent.",
  ],
  fields: {
    fromWarehouseId: { labels: ["From"], meaning: "The hub or warehouse the stock is in now. Every unit there that isn't held for an order moves." },
    toWarehouseId: { labels: ["To"], meaning: "Where the stock goes. Only open hubs and warehouses in the same country are listed.", mistakes: ["The destination must have room under its tier."] },
    reason: { labels: ["Why"], meaning: "Why the stock is moving. The sending hub sees this.", mistakes: ["At least 10 characters."] },
    lotIds: { labels: [], meaning: "Particular lots to move. Not chosen on this form: every unit that isn't held for an order moves." },
  },
  related: [
    { href: "/admin/warehouses", label: "Warehouses" },
    { href: "/admin/stock", label: "Stock" },
  ],
});

const HUB_TRANSFERS: Omit<PageKnowledgeOf<DispatchTransferInput & ReceiveTransferInput>, "route"> = {
  title: "Transfers",
  purpose: "Stock moving between hubs: seal and photograph boxes you send, and count in stock that arrives.",
  steps: [
    "To send: seal the boxes, enter the carrier, tracking and seal numbers, add a photo of the sealed boxes and mark it as sent.",
    "To receive: check the seal is unbroken, count every item and enter the numbers.",
    "Anything missing is raised with the sending hub automatically.",
  ],
  fields: {
    carrier: { labels: ["Carrier"], meaning: "The delivery company taking the boxes.", mistakes: ["Between 2 and 80 characters."] },
    trackingNumber: { labels: ["Tracking number"], meaning: "The carrier's tracking number for the boxes.", mistakes: ["Between 3 and 80 characters."] },
    sealNumber: { labels: ["Seal number"], meaning: "The number on the seal used to close the boxes. The receiving hub checks it's unbroken.", mistakes: ["Between 3 and 40 characters."] },
    photoFileIds: {
      labels: ["Photo of the sealed boxes", /^Photo of the sealed boxes \d+$/, "Choose file"],
      meaning: "Photos of the sealed boxes showing the seal and the labels clearly.",
      mistakes: ["Add at least one photo.", "Up to 6 photos."],
    },
    lines: { labels: [/ · /], meaning: "How many of each item arrived, counted by you. Enter what you counted; anything missing is raised with the sending hub." },
  },
  related: [{ href: "/admin/stock", label: "Stock" }],
};

export const HUB_TRANSFERS_KNOWLEDGE = describePage<DispatchTransferInput & ReceiveTransferInput>({ ...HUB_TRANSFERS, route: "/admin/hub-transfers" });
export const PARTNER_TRANSFERS_KNOWLEDGE = describePage<DispatchTransferInput & ReceiveTransferInput>({ ...HUB_TRANSFERS, route: "/admin/partnership/transfers" });

export const PARTNER_CLAIMS_KNOWLEDGE = describePage<z.infer<typeof claimResponseSchema>>({
  route: "/admin/partnership/claims",
  title: "Claims",
  purpose: "For fulfilment partners: claims about missing or damaged stock. If we think it happened at your hub, you can give your side before we decide.",
  steps: ["Read each claim and our assessment.", "If we think your hub is responsible, write your side and send it.", "Watch your trust score alongside."],
  fields: {
    response: {
      labels: ["Your side"],
      meaning: "Your side of what happened. Mention anything that helps, like when you last counted or how it was packed.",
      mistakes: ["You can respond once.", "At least 10 characters."],
    },
  },
  related: [
    { href: "/admin/partnership", label: "Partnership" },
    { href: "/admin/partnership/stock-counts", label: "Stock counts" },
  ],
});
