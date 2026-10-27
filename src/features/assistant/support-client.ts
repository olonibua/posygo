import { scrubSensitive, type SupportReportInput, type SupportReportResult } from "@/shared";

import { apiRequest } from "@/lib/api/client";

import type { NoticedError } from "./conversation/replies";
import type { TrailStep } from "./signals/trail";

interface ReportDraft {
  page: string;
  trail: readonly TrailStep[];
  signedIn: boolean;
}

function send(input: SupportReportInput, signedIn: boolean): Promise<SupportReportResult> {
  return signedIn
    ? apiRequest<SupportReportResult>("/v1/support-cases", { method: "POST", body: input })
    : apiRequest<SupportReportResult>("/v1/public/support-cases", { method: "POST", body: input, authenticated: false });
}

export function reportError(draft: ReportDraft, error: NoticedError, message = ""): Promise<SupportReportResult> {
  return send(
    {
      kind: "ERROR",
      page: draft.page,
      message: scrubSensitive(message),
      trail: [...draft.trail],
      error: { code: error.code, status: error.status, endpoint: error.endpoint, ...(error.correlationId ? { correlationId: error.correlationId } : {}) },
    },
    draft.signedIn,
  );
}

export function askTeam(draft: ReportDraft, question: string, contactEmail?: string): Promise<SupportReportResult> {
  return send({ kind: "QUESTION", page: draft.page, message: scrubSensitive(question), trail: [...draft.trail], ...(contactEmail ? { contactEmail } : {}) }, draft.signedIn);
}
