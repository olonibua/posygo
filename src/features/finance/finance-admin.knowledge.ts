import type { AdjustmentDecisionInput, FeeSchedule, FeeScheduleDecisionInput, ProposeFeeScheduleInput, RequestAdjustmentInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const FINANCE_WALLETS_KNOWLEDGE = describePage<Record<"market", unknown>>({
  route: "/admin/finance",
  title: "Vendor wallets",
  purpose: "For the finance team: every vendor's prepaid wallet, its status and balance, across every market.",
  steps: [
    "Check the tiles for wallets with overdue storage, paused wallets and adjustments waiting for a second person.",
    "Filter by status or pick a market to narrow the list.",
    "Open a wallet to see its ledger, adjust its balance or pause its charges.",
  ],
  fields: { market: { labels: ["Market"], meaning: "Shows only the wallets in one market. Each wallet holds money in its market's currency." } },
  related: [
    { href: "/admin/finance/adjustments", label: "Adjustments" },
    { href: "/admin/finance/reconciliation", label: "Reconciliation" },
    { href: "/admin/fees", label: "Prices" },
  ],
});

export const FINANCE_WALLET_KNOWLEDGE = describePage<RequestAdjustmentInput>({
  route: "/admin/finance/wallets/[id]",
  title: "Vendor wallet",
  purpose: "For the finance team: one vendor's balance and ledger, with tools to credit or charge it by hand and to pause or resume its charges.",
  steps: [
    "Read the ledger to see every top-up and charge.",
    "To correct the balance, choose Credit or Charge, enter the amount and a reason, then submit the adjustment.",
    "If the amount is above the market's limit, wait for a second person to approve it on the Adjustments page.",
    "To stop charges while a payment is looked into, give a reason and pause the wallet. Resume it the same way.",
  ],
  fields: {
    direction: { labels: ["Direction", "Credit", "Charge"], meaning: "Credit adds money to the vendor's wallet. Charge takes money from it." },
    amountMinor: {
      labels: ["Amount"],
      meaning: "How much to credit or charge, in the wallet's currency. Amounts above the market's second approval limit wait for another person to approve them.",
      mistakes: ["The amount must be more than zero."],
    },
    reason: {
      labels: ["Reason"],
      meaning: "Why you're adjusting the balance, or why you're pausing or resuming the wallet. For an adjustment, the vendor sees it on their statement. For a pause, it's kept in the audit log.",
      mistakes: ["It must be at least 10 characters."],
    },
    reference: { labels: ["Reference (optional)"], meaning: "A ticket or claim number this adjustment relates to, so it can be traced later. Optional.", mistakes: ["Up to 120 characters."] },
  },
  related: [
    { href: "/admin/finance", label: "All wallets" },
    { href: "/admin/finance/adjustments", label: "Adjustments" },
  ],
});

export const ADJUSTMENTS_KNOWLEDGE = describePage<AdjustmentDecisionInput>({
  route: "/admin/finance/adjustments",
  title: "Adjustments",
  purpose: "For the finance team: manual credits and charges, and the ones waiting for a second person to approve them.",
  steps: ["Filter by status. Waiting for approval is shown first.", "Press Review on an adjustment someone else asked for.", "Write a note for the record, then approve or reject it."],
  fields: {
    approve: { labels: [], meaning: "Whether you approve or reject the adjustment. You choose with the Approve and Reject buttons." },
    note: {
      labels: ["Note for the record"],
      meaning: "Why you approved or rejected the adjustment. It's kept with the decision.",
      mistakes: ["It must be at least 5 characters.", "You can't decide on an adjustment you asked for yourself."],
    },
  },
  related: [
    { href: "/admin/finance", label: "Vendor wallets" },
    { href: "/admin/finance/reconciliation", label: "Reconciliation" },
  ],
});

export const RECONCILIATION_KNOWLEDGE = describePage({
  route: "/admin/finance/reconciliation",
  title: "Reconciliation",
  purpose: "For the finance team: checks that every wallet's balance matches the sum of its ledger.",
  steps: [
    "Look at the latest check. All match means no differences were found.",
    "If differences are listed, open each wallet to investigate.",
    "Press Check now to run a check straight away. The check also runs every night at 03:00 UTC.",
  ],
  fields: {},
  related: [
    { href: "/admin/finance", label: "Vendor wallets" },
    { href: "/admin/finance/adjustments", label: "Adjustments" },
  ],
});

export const FEES_KNOWLEDGE = describePage<ProposeFeeScheduleInput & FeeScheduleDecisionInput & FeeSchedule & Record<"market", unknown>>({
  route: "/admin/fees",
  title: "Prices",
  purpose: "For the finance team: each market's price list, its history, and changes waiting for approval.",
  steps: [
    "Pick the market.",
    "Press Propose a change to start from the prices in use.",
    "Change the prices, explain why, and send it for approval.",
    "Another finance admin approves or rejects it. Once approved it replaces the current price list, and charges already taken keep their old price.",
  ],
  fields: {
    market: { labels: ["Market"], meaning: "The market whose price list you're looking at. Each market has its own prices in its own currency." },
    schedule: {
      labels: [],
      meaning: "The full price list you're proposing, made up of every amount on the form.",
      mistakes: ["Every amount must be a number. Only Each month can be left empty, and sizes set to By quote need no stocking or first month price."],
    },
    note: {
      labels: ["Why the change", "Note for the record"],
      meaning: "Why you're proposing the change, which the approver sees, or why you're approving or rejecting someone else's.",
      mistakes: ["It must be at least 10 characters.", "You can't approve or reject a change you proposed."],
    },
    approve: { labels: [], meaning: "Whether you approve or reject the proposed prices. You choose with the Approve and Reject buttons." },
    onboarding: {
      labels: ["By quote", /stocking$/, /first month$/],
      meaning: "For each box size, the stocking fee and the first month of storage, charged when a vendor submits a shipment. Choose By quote to price that size case by case instead.",
    },
    monthlyStorage: { labels: [/each month$/], meaning: "The monthly storage price for each box size. Leave it empty to price that size by quote." },
    fulfilment: {
      labels: ["Packing, first unit", "Each extra unit", "Packing cap per order"],
      meaning: "The pick and pack fee for an order: a price for the first unit, a price for each extra unit, and the most one order can cost.",
      mistakes: ["The cap can't be below the first unit price."],
    },
    returnsHandlingMinor: { labels: ["Handling a return"], meaning: "What the vendor is charged when the hub handles a returned parcel." },
    shippingMarkupBps: { labels: ["Shipping markup"], meaning: "A percentage added on top of the carrier's cost for shipping.", mistakes: ["Up to 50 percent."] },
    firstShipmentWaivesStocking: { labels: ["First shipment’s stocking is free"], meaning: "When selected, a vendor's first shipment isn't charged the stocking fee." },
    adjustments: {
      labels: ["Second approval above", "Daily adjustment limit"],
      meaning: "Limits on manual wallet adjustments. Adjustments above the first amount wait for another person. The daily limit is per person, per 24 hours.",
      mistakes: ["The daily limit must be more than zero."],
    },
    partner: {
      labels: ["What partners earn", "Share of receiving", "Share of storage", "Share of pick and pack", "Founding partner bonus", "Founding places", "Held back", "Released after (days)"],
      meaning:
        "What fulfilment partners keep: a percentage of receiving, storage and pick and pack fees, an extra bonus for the first partners in the country, and a part of each earning held back to cover claims for a number of days.",
      mistakes: ["The founding bonus can be up to 30 percentage points.", "Up to 100 founding places.", "Held back can be up to 50 percent.", "Released after can be up to 365 days."],
    },
    storefront: {
      labels: ["Vendor stores", "Set-up fee", "Our commission (%)", "Shortest payout hold (hours)"],
      meaning:
        "Charges for vendor stores: a one-off set-up fee from the wallet when a store opens, our commission on each sale's goods, and the shortest time a store's payout is held after the parcel leaves.",
      mistakes: ["Commission can be up to 30 percent.", "The hold can be up to 720 hours."],
    },
    referral: {
      labels: ["Referrals", "Credit for the referrer", "Credit for the new vendor", "Rewards per referrer each month"],
      meaning: "The wallet credit given to a vendor who refers a business and to the new vendor, once the new vendor's first stock arrives, and how many rewards one referrer can get each month.",
      mistakes: ["Up to 100 rewards per referrer each month."],
    },
    shopping: {
      labels: ["Personal shopping", "Our fee (%)", "Smallest fee"],
      meaning: "What we charge on personal shopping requests: a percentage of the goods' price, or the smallest fee when the percentage comes to less.",
    },
  },
  related: [
    { href: "/admin/finance", label: "Vendor wallets" },
    { href: "/admin/finance/adjustments", label: "Adjustments" },
    { href: "/admin/countries", label: "Countries" },
  ],
});
