import type { ResolveSupportCaseInput } from "@/shared";

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
