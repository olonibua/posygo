import { errorGuide } from "@/shared";

import { ASSISTANT } from "../assistant-identity";
import { fieldFor, type FieldHelp, type PageKnowledge } from "../knowledge/types";
import { type ChatMessage, type HelperAction, helperSays } from "./messages";

export interface NoticedError {
  code: string;
  status: number;
  message: string;
  endpoint: string;
  correlationId: string | null;
  rejectedFields: readonly string[];
}

const ASK_TEAM: HelperAction = { kind: "ask-team", label: "Ask our team" };
const NETWORK = "network_error";

export function greeting(page: PageKnowledge | undefined): ChatMessage {
  const intro = `Hi, I'm ${ASSISTANT.name}. I can explain this page or any field on it, sort out errors, or get our team for you.`;
  return helperSays(intro, page ? [{ kind: "explain-page", label: `Explain "${page.title}"` }, ASK_TEAM] : [ASK_TEAM]);
}

export function pageReply(page: PageKnowledge): ChatMessage {
  const steps = page.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return helperSays(
    `${page.purpose}\n\nHere's how it goes:\n${steps}\n\nClick into any field and ask me about it.`,
    page.related.map((link) => ({ kind: "link", ...link })),
  );
}

function describeField(label: string, help: FieldHelp): string {
  const parts = [`${label}: ${help.meaning}`];
  if (help.example) {
    parts.push(`For example: ${help.example}`);
  }
  if (help.mistakes?.length) {
    parts.push(`Watch out for:\n${help.mistakes.map((mistake) => `• ${mistake}`).join("\n")}`);
  }
  return parts.join("\n\n");
}

export function fieldReply(label: string, page: PageKnowledge | undefined): ChatMessage {
  const help = page ? fieldFor(page, label) : undefined;
  return help ? helperSays(describeField(label, help)) : helperSays(`I don't have notes on "${label}" yet. I can pass your question to our team.`, [ASK_TEAM]);
}

export function stuckNudge(label: string): string {
  return `Stuck on "${label}"? I can explain it.`;
}

export function errorNudge(error: NoticedError, reference: string | null): string {
  if (error.code === NETWORK) {
    return "I can't reach us right now. Your entries are still here.";
  }
  const guide = errorGuide(error.code, error.status);
  if (guide.side === "SYSTEM") {
    return reference ? `That one's on our side, not yours. I've told our team (${reference}).` : "That one's on our side, not yours. Want me to tell our team?";
  }
  return "That didn't go through. Want me to explain why?";
}

export function errorReply(error: NoticedError, reference: string | null): ChatMessage {
  if (error.code === NETWORK) {
    return helperSays("I couldn't reach our servers, so nothing was saved yet. Check your internet connection, then try again. Your entries on this page are still here.");
  }
  const guide = errorGuide(error.code, error.status);
  const fieldActions: HelperAction[] = error.rejectedFields.slice(0, 4).map((field) => ({ kind: "explain-field", field, label: `Explain "${field}"` }));
  if (guide.side === "SYSTEM") {
    const told = reference
      ? `I've already told our team and your case number is ${reference}. They can see exactly what happened, so you don't need to explain it.`
      : "I can tell our team right now, with everything they need to see what happened.";
    return helperSays(`This isn't something you did. ${guide.meaning} ${told}\n\n${guide.nextStep}`, reference ? undefined : [{ kind: "report-error", label: "Tell the team" }]);
  }
  const intro = error.message && error.message !== guide.meaning ? `The page said: "${error.message}"\n\n` : "";
  const support: HelperAction[] = guide.needsSupport ? [{ kind: "report-error", label: "Get our team to help" }] : [];
  return helperSays(`${intro}${guide.meaning} ${guide.nextStep}`, [...fieldActions, ...support]);
}

const STOP_WORDS = new Set(["what", "does", "the", "this", "that", "mean", "means", "for", "how", "do", "i", "is", "a", "an", "my", "to", "in", "of", "and", "should", "put", "enter", "field", "box"]);

function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")} `;
}

function fieldNames(page: PageKnowledge): Array<{ name: string; label: string }> {
  return Object.values(page.fields).flatMap((field) =>
    field.labels.map((match) => {
      const name = typeof match === "string" ? match : match.source.replace(/[\^$\\]|\(\?:|\)|\\d\+|\[.*?\]|\|.*$/g, "").trim();
      return { name: normalise(name.replace(/\s*\(optional\)$/i, "")).trim(), label: typeof match === "string" ? match : name };
    }),
  );
}

export type Intent = { kind: "field"; label: string } | { kind: "page" } | { kind: "error" } | { kind: "team" } | { kind: "unknown" };

export function understand(question: string, page: PageKnowledge | undefined, hasError: boolean): Intent {
  const text = normalise(question);
  if (/ (human|person|someone|support|agent|team|call me|contact) /.test(text)) {
    return { kind: "team" };
  }
  if (hasError && / (error|wrong|failed|fail|didn t work|not working|went wrong|why) /.test(text)) {
    return { kind: "error" };
  }
  if (page) {
    const hit = fieldNames(page)
      .filter((field) => field.name.length > 2 && text.includes(` ${field.name} `))
      .sort((a, b) => b.name.length - a.name.length)[0];
    if (hit) {
      return { kind: "field", label: hit.label };
    }
    const words = text.split(" ").filter((word) => word.length > 2 && !STOP_WORDS.has(word));
    if (words.length === 0 || / (this page|start|steps|how does|what do i do|explain) /.test(text)) {
      return { kind: "page" };
    }
  }
  return { kind: "unknown" };
}

export function unsureReply(): ChatMessage {
  return helperSays("I'm not sure about that one yet, and I'd rather not guess. I can send your question to our team.", [ASK_TEAM]);
}
