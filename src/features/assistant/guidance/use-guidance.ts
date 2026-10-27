"use client";

import { useCallback, useRef } from "react";

import { type ChatMessage, type HelperAction, helperSays } from "../conversation/messages";
import { fieldFor, type PageKnowledge } from "../knowledge/types";
import { applyFix, fieldsOnScreen, findField, highlight, type OnScreenField, suggestedFix } from "./page-fields";

const TOUR_STOP: HelperAction = { kind: "tour-stop", label: "Stop" };

export function useGuidance(page: PageKnowledge | undefined, speak: (...replies: ChatMessage[]) => void) {
  const tour = useRef<{ fields: OnScreenField[]; index: number } | null>(null);

  const showStep = useCallback(() => {
    const current = tour.current;
    const step = current?.fields[current.index];
    if (!current || !step) {
      return;
    }
    highlight(step.element);
    const last = current.index === current.fields.length - 1;
    const example = step.help.example ? `\n\nFor example: ${step.help.example}` : "";
    speak(
      helperSays(`Step ${current.index + 1} of ${current.fields.length}: ${step.label}\n\n${step.help.meaning}${example}`, [
        { kind: "tour-next", label: last ? "Finish" : "Next" },
        ...(last ? [] : [TOUR_STOP]),
      ]),
    );
  }, [speak]);

  const startTour = useCallback(() => {
    const fields = page ? fieldsOnScreen(page) : [];
    if (fields.length === 0) {
      speak(helperSays("There's nothing to fill in on this part of the page right now. Ask me about anything you can see."));
      return;
    }
    tour.current = { fields, index: 0 };
    showStep();
  }, [page, showStep, speak]);

  const nextStep = useCallback(() => {
    const current = tour.current;
    if (!current) {
      return;
    }
    if (current.index >= current.fields.length - 1) {
      tour.current = null;
      speak(helperSays(page ? `That's everything. ${page.steps.at(-1) ?? ""}`.trim() : "That's everything."));
      return;
    }
    current.index += 1;
    showStep();
  }, [page, showStep, speak]);

  const stopTour = useCallback(() => {
    tour.current = null;
    speak(helperSays("No problem. I'm here if you need me."));
  }, [speak]);

  const fixesFor = useCallback(
    (labels: readonly string[]): HelperAction[] =>
      labels.flatMap((label) => {
        const value = page ? suggestedFix(label, fieldFor(page, label)) : null;
        return value ? [{ kind: "fix-field" as const, field: label, value, label: `Yes, change "${label}" to ${value}` }] : [];
      }),
    [page],
  );

  const fix = useCallback(
    (field: string, value: string) => {
      speak(applyFix(field, value) ? helperSays(`Done. I've changed "${field}". Check it looks right, then try again.`) : helperSays(`I couldn't find "${field}" on the page any more.`));
    },
    [speak],
  );

  const show = useCallback((field: string) => {
    const element = findField(field);
    if (element) {
      highlight(element);
    }
  }, []);

  return { startTour, nextStep, stopTour, fixesFor, fix, show };
}
