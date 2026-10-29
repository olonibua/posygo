import { ASSISTANT_SCREEN_LIMITS, type AssistantScreenInput } from "@/shared";

import { fieldLabelOf, isHelperElement } from "./field-label";

const CONTROLS = "input, select, textarea";
const SKIPPED_TYPES = new Set(["hidden", "password", "file", "submit", "button", "reset", "image"]);
const PRIVATE_AUTOFILL = /^(cc-|one-time-code|new-password|current-password)/;

interface ScreenField {
  label: string;
  value: string;
}

function clip(text: string | null | undefined, max: number): string {
  return (text ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isPrivate(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
  return (control instanceof HTMLInputElement && SKIPPED_TYPES.has(control.type)) || PRIVATE_AUTOFILL.test(control.autocomplete) || control.closest("[data-private]") !== null;
}

function controlValue(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | null {
  if (control instanceof HTMLSelectElement) {
    return control.selectedOptions[0]?.value ? clip(control.selectedOptions[0].textContent, ASSISTANT_SCREEN_LIMITS.value) : "";
  }
  if (control instanceof HTMLInputElement && control.type === "checkbox") {
    return control.checked ? "ticked" : "not ticked";
  }
  if (control instanceof HTMLInputElement && control.type === "radio") {
    return control.checked ? "chosen" : null;
  }
  return clip(control.value, ASSISTANT_SCREEN_LIMITS.value);
}

function formFields(root: ParentNode): ScreenField[] {
  return [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(CONTROLS)].flatMap((control) => {
    if (isHelperElement(control) || isPrivate(control) || control.getClientRects().length === 0) {
      return [];
    }
    const label = fieldLabelOf(control);
    const value = controlValue(control);
    return label && value !== null ? [{ label, value }] : [];
  });
}

function choiceFields(root: ParentNode): ScreenField[] {
  return [...root.querySelectorAll<HTMLElement>('[role="radiogroup"]')].flatMap((group) => {
    const label = clip(group.getAttribute("aria-label"), ASSISTANT_SCREEN_LIMITS.label);
    const chosen = group.querySelector('[role="radio"][aria-checked="true"]');
    return label && !isHelperElement(group) ? [{ label, value: clip(chosen?.textContent, ASSISTANT_SCREEN_LIMITS.value) }] : [];
  });
}

function unique(fields: ScreenField[]): ScreenField[] {
  const seen = new Set<string>();
  return fields.filter((field) => !seen.has(field.label) && seen.add(field.label));
}

export function readScreen(root: Document = document): AssistantScreenInput {
  const main = root.querySelector("main") ?? root.body;
  const title = clip(main.querySelector("h1")?.textContent, 160);
  const focused = root.activeElement ? fieldLabelOf(root.activeElement) : null;
  const alerts = [...main.querySelectorAll('[role="alert"]')]
    .map((alert) => clip(alert.textContent, ASSISTANT_SCREEN_LIMITS.alert))
    .filter(Boolean)
    .slice(0, ASSISTANT_SCREEN_LIMITS.alerts);
  return {
    ...(title ? { title } : {}),
    ...(focused ? { focused } : {}),
    fields: unique([...choiceFields(main), ...formFields(main)]).slice(0, ASSISTANT_SCREEN_LIMITS.fields),
    alerts,
  };
}
