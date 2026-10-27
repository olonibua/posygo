import { describePage } from "@/features/assistant/knowledge/types";
import { PARTNERSHIP, type PartnershipInput } from "@/features/partners/partner-console.knowledge";

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

export const CONSOLE_SECURITY_KNOWLEDGE = describePage({
  route: "/admin/security",
  title: "Sign-in & security",
  purpose: "Your own sign-in protection: two-factor authentication and how long you stay signed in.",
  steps: ["Check whether two-factor authentication is on.", "If it's off, press Turn on and add a code from an authenticator app on your phone.", "Keep your recovery codes somewhere safe."],
  fields: {},
  related: [{ href: "/mfa/setup", label: "Turn on two-factor authentication" }],
});
