import type { ActivationFeeInput, PartnerProgramme } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const COUNTRIES_KNOWLEDGE = describePage<PartnerProgramme & ActivationFeeInput>({
  route: "/admin/countries",
  title: "Markets",
  purpose: "Every country on the network, its status, its activation fee for new vendors, and the rules for its fulfilment partner programme. Going live needs at least one approved fulfilment hub.",
  steps: [
    "Filter by status to find a country.",
    "Press Activation fee to set the one-off fee new vendors in that country pay before going live, then save it. Only a super admin can change it.",
    "Press Partner settings to open that country's partner programme.",
    "Set whether it takes applications, the tax and work rules, the safeguards, the custody rules and the tiers.",
    "Save the partner settings.",
  ],
  fields: {
    activationFeeMinor: {
      labels: ["Activation fee"],
      meaning:
        "A one-off fee, in the country's currency, that vendors pay once they're verified and have accepted the agreement. We keep it and it isn't refundable. Zero means no fee, so vendors go live straight away, and setting it to zero makes anyone waiting to pay live. A change applies to vendors who haven't paid yet, never to vendors already live.",
      example: "8.00",
      mistakes: ["Use a number like 8 or 8.50, with no more decimal places than the currency allows.", "It can't be negative."],
    },
    acceptingApplications: { labels: ["Take partner applications in this country"], meaning: "When ticked, people in this country can apply to become fulfilment partners." },
    taxId: {
      labels: ["Tax reference name", "Format (pattern)", "Required"],
      meaning: "The tax reference partners give: what it's called in this country, an optional pattern their entry is checked against, and whether it's required.",
    },
    workDeclaration: {
      labels: ["Work and tax declaration"],
      meaning: "The statement partners tick to confirm they can work and will declare their earnings for tax.",
      mistakes: ["Between 20 and 600 characters."],
    },
    platformInsuranceCoverMinor: { labels: ["Platform stock cover"], meaning: "How much our own insurance covers stock at a partner hub. Vendors are shown it as insured stock." },
    depositMinor: { labels: ["Deposit (optional)"], meaning: "A refundable deposit partners in this country pay. Zero means none." },
    insuranceCoverMinor: { labels: ["Own insurance (optional)"], meaning: "The cover partners' own insurance must give. Zero means none." },
    proofOfAddressRetentionDays: {
      labels: ["Keep proof of address (days)"],
      meaning: "How many days after the decision a partner's proof of address is kept before it's deleted.",
      mistakes: ["Between 30 and 730 days."],
    },
    mysteryVendorId: { labels: ["Test vendor account ID"], meaning: "The internal vendor used to place test orders at partner hubs. Leave it blank to turn test orders off." },
    cycleCountDays: {
      labels: ["Custody", "Routine count every (days)"],
      meaning: "How often partners are asked for a routine stock count. Zero turns routine counts off.",
      mistakes: ["Up to 365 days."],
    },
    shrinkageAlertBps: { labels: ["Loss alert (%)"], meaning: "Raises an alert when a hub loses this share of the stock it has received.", mistakes: ["Between 0.1 and 50 percent."] },
    trustFloor: { labels: ["Pause hubs below (score)"], meaning: "Hubs whose trust score falls below this are paused. Out of 100." },
    trustForPromotion: { labels: ["Tier raise needs (score)"], meaning: "The trust score a hub needs to move up a tier. Out of 100." },
    highValueOrderMinor: { labels: ["Tamper seal from"], meaning: "Parcels worth this or more must be closed with a numbered tamper seal." },
    noScanAlertHours: {
      labels: ["Alert after no carrier scan (hours)"],
      meaning: "Raises an alert when the carrier hasn't scanned a parcel this many hours after hand-off.",
      mistakes: ["Between 12 and 240 hours."],
    },
    tiers: {
      labels: ["Tiers", /^Tier \d+ /],
      meaning:
        "The partner tiers. Each has a name, a limit on the stock a hub may hold and on the value of one item, and the clean orders, matched counts and days active needed to reach it. Partners start on tier 1.",
      mistakes: ["Number tiers 1, 2, 3 in order.", "Up to 10 tiers."],
    },
  },
  related: [
    { href: "/admin/partners", label: "Fulfilment partners" },
    { href: "/admin/fees", label: "Prices" },
    { href: "/admin/legal", label: "Legal" },
  ],
});
