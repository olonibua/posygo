import type { SupportCaseKind } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const SUPPORT_KIND_DISPLAY: Record<SupportCaseKind, { label: string; tone: Tone }> = {
  ERROR: { label: "Error", tone: "pink" },
  QUESTION: { label: "Question", tone: "sky" },
  ACCOUNT_CLOSURE: { label: "Close account", tone: "orange" },
  DATA_COPY: { label: "Copy of data", tone: "teal" },
};
