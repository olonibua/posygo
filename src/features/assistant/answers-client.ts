import { ASSISTANT_HISTORY_LIMIT, type AssistantAnswerView, type AssistantStatusView } from "@/shared";

import { apiRequest } from "@/lib/api/client";

import type { ChatMessage } from "./conversation/messages";

export function fetchAnswerStatus(): Promise<AssistantStatusView> {
  return apiRequest<AssistantStatusView>("/v1/public/assistant/status", { authenticated: false });
}

export function askForAnswer(page: string, question: string, earlier: readonly ChatMessage[], signedIn: boolean): Promise<AssistantAnswerView> {
  const body = { page, question, history: earlier.slice(-ASSISTANT_HISTORY_LIMIT).map((message) => ({ from: message.from, text: message.text.slice(0, 1000) })) };
  return signedIn
    ? apiRequest<AssistantAnswerView>("/v1/assistant/answers", { method: "POST", body })
    : apiRequest<AssistantAnswerView>("/v1/public/assistant/answers", { method: "POST", body, authenticated: false });
}
