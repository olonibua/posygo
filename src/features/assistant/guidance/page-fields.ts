import { fieldLabelOf } from "../signals/field-label";
import { fieldFor, type FieldHelp, type PageKnowledge } from "../knowledge/types";

const CONTROLS = "input, select, textarea, fieldset button";
const HIGHLIGHT_MS = 2_400;
const SENSITIVE = new Set(["password", "hidden", "file"]);

export interface OnScreenField {
  label: string;
  help: FieldHelp;
  element: HTMLElement;
}

function visible(element: HTMLElement): boolean {
  return element.offsetParent !== null || element.getClientRects().length > 0;
}

export function fieldsOnScreen(page: PageKnowledge, root: ParentNode = document): OnScreenField[] {
  const seen = new Set<FieldHelp>();
  return [...root.querySelectorAll<HTMLElement>(CONTROLS)].flatMap((element) => {
    const label = fieldLabelOf(element);
    const help = label ? fieldFor(page, label) : undefined;
    if (!label || !help || seen.has(help) || !visible(element)) {
      return [];
    }
    seen.add(help);
    return [{ label, help, element }];
  });
}

export function findField(label: string, root: ParentNode = document): HTMLElement | null {
  return [...root.querySelectorAll<HTMLElement>(CONTROLS)].find((element) => fieldLabelOf(element) === label && visible(element)) ?? null;
}

export function highlight(element: HTMLElement): void {
  element.scrollIntoView({ block: "center", behavior: "smooth" });
  const target = element.closest("fieldset") ?? element;
  target.classList.add("helper-highlight");
  window.setTimeout(() => target.classList.remove("helper-highlight"), HIGHLIGHT_MS);
}

function readable(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return (element instanceof HTMLInputElement && !SENSITIVE.has(element.type)) || element instanceof HTMLTextAreaElement;
}

export function suggestedFix(label: string, help: FieldHelp | undefined, root: ParentNode = document): string | null {
  const element = help?.fix ? findField(label, root) : null;
  if (!element || !readable(element) || !help?.fix) {
    return null;
  }
  const fixed = help.fix(element.value);
  return fixed && fixed !== element.value ? fixed : null;
}

export function applyFix(label: string, value: string, root: ParentNode = document): boolean {
  const element = findField(label, root);
  if (!element || !readable(element)) {
    return false;
  }
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  highlight(element);
  return true;
}
