import { fieldLabelOf } from "./field-label";
import { trail } from "./trail";

function pageName(): string {
  return document.title.split(" · ")[0]?.trim() || window.location.pathname;
}

export function recordOpenedPage(): void {
  trail.add(`Opened ${pageName()}`);
}

export function startTrailRecorder(): () => void {
  const focusIn = (event: FocusEvent) => {
    const label = fieldLabelOf(event.target);
    if (label) {
      trail.add(`Went to ${label}`);
    }
  };
  const input = (event: Event) => {
    const label = fieldLabelOf(event.target);
    if (label) {
      trail.add(`Changed ${label}`);
    }
  };
  document.addEventListener("focusin", focusIn);
  document.addEventListener("input", input);
  return () => {
    document.removeEventListener("focusin", focusIn);
    document.removeEventListener("input", input);
  };
}
