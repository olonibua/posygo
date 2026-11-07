import { describePage } from "@/features/assistant/knowledge/types";
import { PARTNERSHIP, type PartnershipInput } from "@/features/partners/partner-console.knowledge";
import { SIGN_IN_FIELDS, SIGN_IN_STEPS } from "@/features/security/security.knowledge";

export const CONSOLE_OVERVIEW_KNOWLEDGE = describePage<PartnershipInput & Record<"market", unknown>>({
  route: "/admin",
  title: "Overview",
  purpose: "For the platform team: what needs someone now, and how the network has done over the last 30 days. Fulfilment partners see their partnership here instead.",
  steps: [
    "Pick a market, or leave it on Every market, if you look after more than one.",
    "Work through Needs someone. Each line opens the page where the work waits.",
    "Check the last 30 days for new vendors, orders, parcels sent, stock received and money.",
  ],
  fields: { market: { labels: ["Market"], meaning: "Shows the figures for one market only. Every market shows the whole network." }, ...PARTNERSHIP.fields },
  related: [
    { href: "/admin/countries", label: "Countries" },
    { href: "/admin/partnership", label: "Partnership" },
  ],
});

export const CONSOLE_SECURITY_KNOWLEDGE = describePage<Record<keyof typeof SIGN_IN_FIELDS, unknown>>({
  route: "/admin/security",
  title: "Sign-in & security",
  purpose: "Your own sign-in details and protection: your email, your password, two-factor authentication and how long you stay signed in.",
  steps: SIGN_IN_STEPS,
  fields: SIGN_IN_FIELDS,
  related: [{ href: "/mfa/setup", label: "Turn on two-factor authentication" }],
});
