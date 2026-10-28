import type { InviteStaffInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const STAFF_KNOWLEDGE = describePage<InviteStaffInput>({
  route: "/admin/staff",
  title: "Staff",
  purpose: "Everyone with access to the platform console. New staff set up two-factor sign-in before they can do anything.",
  steps: [
    "Check who has access, their role, their country and whether two-factor sign-in is set up.",
    "Invite someone with their email and role. Warehouse operators and country operations staff also need a country.",
    "Revoke an invitation that's no longer needed, or suspend someone who should lose access.",
  ],
  fields: {
    email: { labels: ["Email"], meaning: "The email address of the person you're inviting.", mistakes: ["Enter a valid email address."] },
    role: { labels: ["Role"], meaning: "What the person can do: warehouse operator, country operations, compliance, finance or administrator." },
    countryCode: {
      labels: ["Country"],
      meaning: "The country a warehouse operator or country operations person works in. Other roles cover every country.",
      mistakes: ["Choose the country this person works in."],
    },
  },
  related: [{ href: "/admin/security", label: "Security" }],
});

export const EMAIL_ALERTS_KNOWLEDGE = describePage({
  route: "/admin/email-alerts",
  title: "Email alerts",
  purpose:
    "Choose which staff alerts are also sent by email. Every alert always appears in the bell; switching one on also emails the staff who handle that work, which uses the email allowance.",
  steps: [
    "Find the alert, for example Stock shipments sent by sellers.",
    "Switch it on to email the staff who handle it, or off to keep it in the bell only.",
    "Support cases are emailed by default so system problems reach the team quickly.",
  ],
  fields: {},
  related: [
    { href: "/admin/staff", label: "Staff" },
    { href: "/admin/support", label: "Support cases" },
  ],
});
