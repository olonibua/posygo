import type {
  assessMysterySchema,
  assignWarehouseSchema,
  CreateMysteryOrderInput,
  partnerDecisionSchema,
  partnerRequirementsSchema,
  partnerTeamInviteSchema,
  payoutDecisionSchema,
  recordCallSchema,
  RecordSecurityInput,
  RequestStockCountInput,
  requestPayoutSchema,
  resolveStockCountSchema,
  ReviewCheckInput,
  scheduleCallSchema,
  setTierSchema,
  StatementRange,
} from "@/shared";
import type { z } from "zod";

import { describePage } from "@/features/assistant/knowledge/types";

export const PARTNERS_KNOWLEDGE = describePage({
  route: "/admin/partners",
  title: "Fulfilment partners",
  purpose: "Everyone who has applied to run a fulfilment hub from home, from verification to approval, pausing and closing.",
  steps: [
    "Filter by status, for example Under review to see applications waiting for a decision.",
    "Open a partner to check their verification steps and make a decision.",
    "Use Stock counts, Test orders and Payouts at the top for checks and money across every partner.",
  ],
  fields: {},
  related: [
    { href: "/admin/partners/stock-counts", label: "Stock counts" },
    { href: "/admin/partners/mystery-orders", label: "Test orders" },
    { href: "/admin/partners/payouts", label: "Partner payouts" },
  ],
});

export const PARTNER_CASE_KNOWLEDGE = describePage<
  z.infer<typeof partnerDecisionSchema> &
    z.infer<typeof setTierSchema> &
    z.infer<typeof assignWarehouseSchema> &
    z.infer<typeof partnerRequirementsSchema> &
    z.infer<typeof partnerTeamInviteSchema> &
    ReviewCheckInput &
    z.infer<typeof scheduleCallSchema> &
    z.infer<typeof recordCallSchema> &
    RequestStockCountInput &
    CreateMysteryOrderInput &
    RecordSecurityInput &
    z.infer<typeof requestPayoutSchema> &
    StatementRange
>({
  route: "/admin/partners/[id]",
  title: "Fulfilment partner",
  purpose: "One partner's application, verification checks, decisions, hub set-up, performance and money. What you can do depends on your role.",
  steps: [
    "Check the Ready to approve list to see which steps are still missing.",
    "Review each verification step: open the files, write a note and accept it or ask again.",
    "Make a decision, such as Approve, Send back or Pause hub, with a reason the partner receives by email.",
    "Once the partner is running, request surprise stock counts and place test orders to check their work.",
    "Finance staff record deposits, read the partner's earnings and request payouts.",
  ],
  fields: {
    reason: {
      labels: ["Reason"],
      meaning: "Why you're making a decision about the partner, or why you're changing their tier. The partner receives a decision reason by email.",
      mistakes: ["At least 10 characters."],
    },
    level: {
      labels: ["Level"],
      meaning: "The partner's tier number. Each tier sets how much stock, and how valuable an item, the hub may hold.",
      mistakes: ["A whole number from 1 to 10.", "The tier can only be changed while the partner is approved and running."],
    },
    warehouseId: {
      labels: ["Add another hub"],
      meaning: "Gives the partner an extra hub. Approval creates the first hub from their storage address. Only unassigned hubs in the partner's country are listed.",
    },
    requiredDepositMinor: {
      labels: ["Deposit to hold"],
      meaning: "A refundable deposit the partner must pay before approval. Leave at zero for none.",
      mistakes: ["Requirements can't be changed while the partner is approved and running."],
    },
    requiredInsuranceMinor: {
      labels: ["Insurance cover"],
      meaning: "How much cover the partner's own insurance must give before approval. Leave at zero for none.",
      mistakes: ["Requirements can't be changed while the partner is approved and running."],
    },
    email: { labels: ["Add another partner login"], meaning: "The email of a co-host who shares the partnership. They're sent an invitation.", mistakes: ["Enter a valid email address."] },
    accept: { labels: [], meaning: "Whether you accept a verification step or insurance policy, or send it back. You choose with the Accept or Verify button, or Ask again or Reject." },
    addressMatches: {
      labels: ["The name and address on the document match the application."],
      meaning: "For proof of address only: tick it once you've checked the document shows the partner's name and storage address. You can't accept the step without it.",
    },
    note: {
      labels: ["Note", "Review note"],
      meaning: "On a verification step or insurance policy, the note the partner sees word for word with your decision. On a payout request, why the payout is being made.",
      mistakes: ["A review note must be at least 10 characters.", "A payout note must be at least 5 characters."],
    },
    scheduledAt: { labels: ["Book a call"], meaning: "The date and time of an optional video call to see the partner's storage space. Booking it emails the partner." },
    outcome: { labels: ["What you saw on the call"], meaning: "What you saw of the storage space during the video call. It's kept on the partner's file.", mistakes: ["At least 10 characters."] },
    lines: {
      labels: ["Lines to count"],
      meaning: "How many stock lines the partner must count. We pick them at random, and the partner films the count without seeing our numbers.",
      mistakes: ["Between 1 and 50."],
    },
    dueInHours: { labels: ["Due within (hours)"], meaning: "How long the partner has to send the count.", mistakes: ["Between 12 and 168 hours."] },
    productId: { labels: ["Product"], meaning: "The product to send in a test order. Only products the country's test vendor has in stock at this hub are listed." },
    quantity: { labels: ["Quantity"], meaning: "How many units the test order asks for.", mistakes: ["Between 1 and 5."] },
    recipient: { labels: ["Recipient name", "Address", "City", "Postcode"], meaning: "Where the test order goes: an address we control, so we can check what arrives." },
    kind: { labels: ["Type"], meaning: "Whether the money received is a cash deposit or a bond or guarantee." },
    amountMinor: {
      labels: ["Amount received", "Amount"],
      meaning: "For a deposit, how much was received. For a payout, how much to pay the partner. A payout is approved by a second person in finance on the Partner payouts page.",
      mistakes: ["The amount must be more than zero.", "A payout can only be requested once the partner's payout account is active."],
    },
    reference: {
      labels: ["Bank or bond reference"],
      meaning: "The bank transfer or bond reference for the deposit, so it can be matched to the bank statement. Someone other than you confirms it was received.",
      mistakes: ["At least 3 characters."],
    },
    expiresOn: { labels: ["Expires"], meaning: "When a bond or guarantee ends. Leave it empty for a cash deposit." },
    from: { labels: ["From"], meaning: "The first day of the earnings statement you want to see." },
    to: { labels: ["To"], meaning: "The last day of the earnings statement you want to see.", mistakes: ["The start date must be on or before the end date."] },
  },
  related: [
    { href: "/admin/partners", label: "All partners" },
    { href: "/admin/partners/stock-counts", label: "Stock counts" },
    { href: "/admin/partners/mystery-orders", label: "Test orders" },
    { href: "/admin/partners/payouts", label: "Partner payouts" },
  ],
});

export const MYSTERY_ORDERS_KNOWLEDGE = describePage<z.infer<typeof assessMysterySchema>>({
  route: "/admin/partners/mystery-orders",
  title: "Test orders",
  purpose: "Orders placed from each country's test vendor to an address we control, so we can check what partner hubs send.",
  steps: ["Place a test order from an approved partner's page.", "When the parcel arrives, write what arrived next to the order.", "Press Passed or Failed. The result feeds the partner's scorecard."],
  fields: {
    note: { labels: [/^What arrived for /], meaning: "What actually arrived in the parcel, compared with what was ordered.", mistakes: ["At least 10 characters."] },
    passed: { labels: [], meaning: "Whether the test order passed or failed. You choose with the Passed and Failed buttons." },
  },
  related: [
    { href: "/admin/partners", label: "Fulfilment partners" },
    { href: "/admin/orders", label: "Orders" },
  ],
});

export const PARTNER_PAYOUTS_KNOWLEDGE = describePage<z.infer<typeof payoutDecisionSchema>>({
  route: "/admin/partners/payouts",
  title: "Partner payouts",
  purpose: "For finance staff: payouts requested from partners' pages, waiting for a second person to approve them.",
  steps: [
    "Check the Waiting payouts. You can't approve one you asked for yourself.",
    "Write a note and press Approve or Reject. Approval sends the money through our payment provider.",
    "If a payout is stuck in Sending, press Send again.",
  ],
  fields: {
    note: {
      labels: [/^Note for /],
      meaning: "Why you're approving or rejecting the payout. It's kept with the decision.",
      mistakes: ["At least 5 characters.", "Approval is refused if the partner's bank details changed after the request."],
    },
    approve: { labels: [], meaning: "Whether you approve or reject the payout. You choose with the Approve and Reject buttons." },
  },
  related: [{ href: "/admin/partners", label: "Fulfilment partners" }],
});

export const STOCK_COUNTS_KNOWLEDGE = describePage<z.infer<typeof resolveStockCountSchema>>({
  route: "/admin/partners/stock-counts",
  title: "Stock counts",
  purpose: "Surprise counts filmed by partners, and the ones that didn't match our records or weren't sent in time.",
  steps: [
    "Start with Didn't match and Missed.",
    "Open a count to compare our record with what was counted, and watch the video.",
    "Write what you found and mark it resolved. For a count that didn't match, you can open claims for the missing units.",
  ],
  fields: {
    note: { labels: ["What you found"], meaning: "What you found when you looked into the count. It's recorded on the partner's file.", mistakes: ["At least 10 characters."] },
    openClaims: {
      labels: ["Open claims for the missing units so the vendors' wallets can be credited"],
      meaning: "Opens claims for the missing units, so the vendors' wallets can be credited. Only offered for counts that didn't match.",
    },
  },
  related: [
    { href: "/admin/partners", label: "Fulfilment partners" },
    { href: "/admin/claims", label: "Claims" },
  ],
});
