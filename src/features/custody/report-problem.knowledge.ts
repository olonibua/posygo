import type { ReportClaimInput } from "@/shared";

import type { PageKnowledgeOf } from "@/features/assistant/knowledge/types";

export const REPORT_PROBLEM_FIELDS: PageKnowledgeOf<ReportClaimInput>["fields"] = {
  orderId: { labels: [], meaning: "The order the problem is about. It's filled in for you when you report from an order." },
  lotId: { labels: [], meaning: "The batch of stock the problem is about. It's filled in for you when you report from your stock list." },
  kind: { labels: ["Missing units", "Damaged", "Lost"], meaning: "What went wrong: some units are missing, units are damaged, or the stock was lost altogether." },
  quantity: { labels: ["Units affected"], meaning: "How many units the problem affects. The note under the box shows the most you can report.", mistakes: ["It must be at least 1."] },
  description: {
    labels: ["What happened"],
    meaning: "Tell us when you noticed, what the buyer told you, and anything else that helps us check.",
    mistakes: ["Write at least 20 characters before you can send the report.", "Up to 1000 characters."],
  },
  fileIds: {
    labels: ["Photo or document", /^Photo or document \d+$/, "Choose file", "Replace"],
    meaning: "Photos of the damage or the buyer's message, as a JPEG, PNG, WebP image or a PDF. Optional, up to 6 files of 10 MB each.",
  },
};
