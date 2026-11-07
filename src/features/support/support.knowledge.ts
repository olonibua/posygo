import type { AccountRequestInput, ResolveSupportCaseInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const ADMIN_SUPPORT_KNOWLEDGE = describePage<ResolveSupportCaseInput & { recipient: string }>({
  route: "/admin/support",
  title: "Support cases",
  purpose:
    "Failures on our side and questions people asked. The system opens a case by itself the first time something breaks on our side, before anyone reports it, and emails the support team. Typing mistakes are left out. Reports through Posy join the same case, with the steps each person took.",
  steps: [
    "System problems lists failures on our side. Caught by the system means nobody had to report it.",
    "Open a case and show its details to see each report, the technical reason and the steps the person took.",
    "Fix the problem or answer the question.",
    "Write what was done and mark the case resolved. Everyone who reported it sees your note.",
    "Check Unanswered questions for things the helper couldn't answer.",
    "Use Emails sent to check whether someone's code, invitation or alert went out.",
  ],
  fields: {
    recipient: { labels: ["Find emails sent to"], meaning: "Search the email log by recipient. Part of an address is enough. Codes are never shown in the log." },
    note: { labels: ["What was done"], meaning: "What was done about the problem or question. It's shown to everyone who reported it.", mistakes: ["Between 5 and 500 characters."] },
  },
  related: [{ href: "/admin/verifications", label: "Business verifications" }],
});

const MY_REQUESTS = {
  title: "Help & requests",
  purpose: "Everything you've sent us: questions you asked Posy to pass on, problems you reported, and requests about your account, with our replies. You can also ask for a copy of your data or, if you own the account, ask to close it.",
  steps: [
    "Look under What you've sent us for each question or report and our reply. Open means we're still on it.",
    "To get a copy of the personal details we hold about you, press Ask for a copy. We email it within one month.",
    "To close the account, the owner presses Ask to close, adds anything we should know, and sends it. We settle any balance and collect any stock first.",
  ],
  fields: {
    message: { labels: ["Anything we should know? (optional)"], meaning: "Optional notes for our team, such as why you're closing or when you'd like it done." },
  },
} as const;

export const VENDOR_REQUESTS_KNOWLEDGE = describePage<AccountRequestInput>({
  route: "/settings/requests",
  ...MY_REQUESTS,
  fields: { ...MY_REQUESTS.fields, kind: { labels: [], meaning: "Which request you're sending: a copy of your data or closing the account." } },
  related: [
    { href: "/settings/security", label: "Sign-in & security" },
    { href: "/settings/account", label: "Account" },
  ],
});

export const CONSOLE_REQUESTS_KNOWLEDGE = describePage<AccountRequestInput>({
  route: "/admin/requests",
  ...MY_REQUESTS,
  fields: { ...MY_REQUESTS.fields, kind: { labels: [], meaning: "Which request you're sending: a copy of your data or closing the account." } },
  related: [
    { href: "/admin/security", label: "Sign-in & security" },
    { href: "/admin/partnership/account", label: "Account" },
  ],
});
