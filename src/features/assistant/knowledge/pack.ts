import type { KnowledgeField, KnowledgePack, KnowledgePage } from "@/shared";

import { VENDOR_FAQ } from "@/features/marketing/faq";
import { GUIDES } from "@/features/marketing/guides";
import { PARTNER_FAQ } from "@/features/marketing/partner-landing";

import { PAGE_KNOWLEDGE } from "./registry";
import type { FieldHelp, PageKnowledge } from "./types";

export function readableLabel(match: string | RegExp): string {
  if (typeof match === "string") {
    return match;
  }
  return match.source
    .replace(/\\d\+/g, "1")
    .replace(/[\^$\\]/g, "")
    .replace(/\(([^|)]*)\|[^)]*\)/g, "$1")
    .replace(/[()]/g, "")
    .trim();
}

function field(name: string, help: FieldHelp): KnowledgeField {
  return { name, labels: help.labels.map(readableLabel), meaning: help.meaning, ...(help.example ? { example: help.example } : {}), ...(help.mistakes ? { mistakes: [...help.mistakes] } : {}) };
}

function page(knowledge: PageKnowledge): KnowledgePage {
  return {
    route: knowledge.route,
    title: knowledge.title,
    purpose: knowledge.purpose,
    steps: [...knowledge.steps],
    fields: Object.entries(knowledge.fields).map(([name, help]) => field(name, help)),
    related: knowledge.related.map((link) => ({ ...link })),
  };
}

export function knowledgePack(now = new Date()): KnowledgePack {
  return {
    builtAt: now.toISOString(),
    pages: PAGE_KNOWLEDGE.map(page),
    articles: GUIDES.map((guide) => ({ title: guide.title, path: `/guides/${guide.slug}`, text: guide.sections.map((section) => `${section.heading}. ${section.paragraphs.join(" ")}`).join("\n") })),
    faqs: [...VENDOR_FAQ, ...PARTNER_FAQ].map((item) => ({ question: item.question, answer: item.answer })),
  };
}
