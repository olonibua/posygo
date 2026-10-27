const CONTROLS = "input, select, textarea";

function clean(text: string | null | undefined): string | null {
  const value = text?.replace(/\s+/g, " ").trim();
  return value ? value.slice(0, 120) : null;
}

export function isHelperElement(element: Element): boolean {
  return element.closest("[data-assistant]") !== null;
}

export function fieldLabelOf(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement) || isHelperElement(target)) {
    return null;
  }
  if (target.matches(CONTROLS)) {
    const control = target as HTMLInputElement;
    if (control.type === "hidden") {
      return null;
    }
    return clean(control.labels?.[0]?.textContent) ?? clean(control.getAttribute("aria-label")) ?? clean(control.closest("fieldset")?.querySelector("legend")?.textContent);
  }
  const fieldset = target.closest("fieldset");
  return target.matches("button") && fieldset ? clean(fieldset.querySelector("legend")?.textContent) : null;
}

export function rejectedFieldLabels(root: ParentNode): string[] {
  return [...root.querySelectorAll('[aria-invalid="true"]')].flatMap((element) => {
    const label = fieldLabelOf(element);
    return label ? [label] : [];
  });
}
