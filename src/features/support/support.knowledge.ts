import type { ResolveSupportCaseInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const ADMIN_SUPPORT_KNOWLEDGE = describePage<ResolveSupportCaseInput & { recipient: string }>({
  route: "/admin/support",
  title: "Support cases",
  purpose: "Problems people hit and questions they asked the helper. The same failure from several people is grouped into one case, with the steps each person took.",
  steps: [
    "Open a case and show its details to see each report and the steps the person took.",
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
